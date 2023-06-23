// routes/posts.route.js

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
// routes/posts.route.js

// 게시글 목록 조회
router.get("/posts", async (req, res) => {
  const posts = await Posts.findAll({
    attributes: ["postId", "title", "createdAt"],
    include: [
      {
        model: Users,
        attributes: ["email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({ data: posts });
});

// routes/posts.route.js

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const post = await Posts.findOne({
    attributes: ["postId", "title", "content", "createdAt", "updatedAt"],
    where: { postId },
  });

  return res.status(200).json({ data: post });
});

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

module.exports = router;
