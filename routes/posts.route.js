const express = require("express");
const { Posts, Users, postLikes } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const { Op } = require("sequelize");

// 게시글 생성
router.post("/posts", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  const post = await Posts.create({
    UserId: userId,
    title,
    content,
  });

  return res.status(201).json({ data: post });
});

// 게시글 목록 조회
router.get("/posts", async (req, res) => {
  const posts = await Posts.findAll({
    attributes: ["postId", "title", "createdAt", "likes"],
    include: [
      {
        model: Users,
        attributes: ["nickname"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({ data: posts });
});

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const post = await Posts.findOne({
    attributes: [
      "postId",
      "title",
      "content",
      "likes",
      "createdAt",
      "updatedAt",
    ],
    where: { postId },
  });

  return res.status(200).json({ data: post });
});

// 게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  // 게시물 수정
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  const post = await Posts.findOne({ where: { postId } });
  if (!post) {
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  } else if (post.UserId !== userId) {
    return res.status(404).json({ message: "수정할 권한이 없습니다." });
  }

  await Posts.update(
    { title, content },
    {
      where: {
        [Op.and]: [{ postId }, [{ UserId: userId }]],
      },
    }
  );
  res.status(200).json({ data: "게시글이 수정되었습니다." });
});

// 게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const post = await Posts.findOne({ where: { postId } });
  if (!post) {
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
  } else if (post.UserId !== userId) {
    return res.status(404).json({ message: "수정할 권한이 없습니다." });
  }

  await Posts.destroy({ where: { postId } });

  res.status(200).json({ data: "게시글이 삭제되었습니다." });
});

// 좋아요 기능
router.put("/posts/:postId/likes", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  try {
    const existPost = await Posts.findOne({ where: { postId } });
    const existPostLikes = await postLikes.findOne({
      where: { postId, userId },
    });
    const likes = existPost.likes;

    if (!existPost) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    if (!existPostLikes) {
      await postLikes.create({
        userId,
        postId,
      });
      await Posts.update(
        { likes: likes + 1 },
        {
          where: { postId },
        }
      );
      return res.status(200).json({ message: "좋아요가 추가되었습니다." });
    } else {
      await postLikes.destroy({ where: { postId, userId } });
      await Posts.update(
        { likes: likes - 1 },
        {
          where: { postId },
        }
      );
      return res.status(200).json({ message: "좋아요가 취소되었습니다." });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ errorMessage: error });
  }
});

module.exports = router;
