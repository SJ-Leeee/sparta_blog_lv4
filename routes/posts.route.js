const express = require("express");
const { Posts, Users } = require("../models");
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

router.put("/likes/:postId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const post = await Posts.findOne({ where: { postId } });
  const user = await Users.findOne({ where: { userId } });
  try {
    if (!post) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    } else if (post.UserId !== userId) {
      return res.status(404).json({ message: "좋아요 할 권한이 없습니다." });
    }
    const likes = post.likes;
    const likePosts = user.likePosts; // 문자열 형태의 likePosts 가져옴
    const likePostsArr = likePosts ? JSON.parse(likePosts) : []; // likePostsArr이 존재하면 배열형태로 저장 아무것도 없으면 빈배열로 저장
    const isExist = likePostsArr.filter((likePost) => likePost == postId);
    if (!isExist.length) {
      likePostsArr.push(Number(postId)); // 숫자형태의 postId를 배열에 넣어서 추가해줌
      const likePostsArrToStr = JSON.stringify(likePostsArr);

      await Posts.update({ likes: likes + 1 }, { where: { postId } });
      await Users.update(
        { likePosts: likePostsArrToStr },
        { where: { userId } }
      );
      return res.status(200).json({ message: "좋아요가 추가 되었습니다" });
    } else {
      const subLikePost = likePostsArr.filter(
        (likePost) => likePost !== Number(postId)
      );
      const likePostsArrToStr = JSON.stringify(subLikePost);
      await Posts.update({ likes: likes - 1 }, { where: { postId } });
      await Users.update(
        { likePosts: likePostsArrToStr },
        { where: { userId } }
      );
      return res.status(200).json({ message: "좋아요가 해제되었습니다" });
    }
  } catch (error) {
    return res.status(400).send(error);
  }
});

module.exports = router;
