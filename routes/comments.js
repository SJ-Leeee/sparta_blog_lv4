const { Comments } = require("../models");
const { Posts, Users, UserInfos } = require("../models");
const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const { Op } = require("sequelize");

//댓글 생성
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const { userId } = res.locals.user;
  if (!content) {
    return res.status(412).json({ errorMessage: "내용을 입력해주세요!" });
  }

  const postIdCheck = await Posts.findOne({ where: { postId } });
  if (!postIdCheck) {
    return res
      .status(404)
      .json({ errorMessage: "게시글이 존재하지 않습니다." });
  }

  try {
    await Comments.create({
      PostId: postId,
      comment: content,
      UserId: userId,
    });
  } catch {
    return res
      .status(400)
      .json({ errorMessage: "댓글 작성에 실패하였습니1다." });
  }
  res.status(200).json({ message: "댓글을 작성하였습니다." });
});
//댓글 조회
router.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  try {
    const comment = await Comments.findAll(
      {
        where: { postId },
        include: [
          {
            model: Users,
            attributes: ["nickname"],
          },
        ],
      },
      { order: [["created_at", "desc"]] }
    );
    if (!comment) {
      return res
        .status(404)
        .json({ errorMessage: "댓글이 존재하지 않습니다." });
    }
    res.status(200).json({ comment });
  } catch {
    return res
      .status(400)
      .json({ errorMessage: "댓글 조회에 실패하였습니다." });
  }
});

//댓글 수정
router.put(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const { userId } = res.locals.user;
    if (!content) {
      return res.status(412).json({ errorMessage: "내용을 입력해주세요!" });
    }

    const postIdCheck = await Posts.findOne({ where: { postId } });
    if (!postIdCheck) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    try {
      const comment = await Comments.findOne({ where: { Id: commentId } });
      if (comment.UserId !== userId) {
        return res
          .status(403)
          .json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
      }
    } catch (err) {
      console.lor(err);
      return res
        .status(404)
        .json({ errorMessage: "댓글이 존재하지 않습니다." });
    }
    try {
      await Comments.update(
        { comment: content }, // title과 content 컬럼을 수정합니다.
        {
          where: {
            [Op.and]: [
              { Id: commentId },
              { UserId: userId },
              { PostId: postId },
            ],
          },
        }
      );
      res.status(200).json({ message: "댓글이 수정되었습니다." });
    } catch (err) {
      console.log(err);
      res.status(400).json({ errorMessage: "댓글 수정이 실패되었습니다." });
    }
  }
);

//댓글 삭제
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId } = res.locals.user;
    try {
      const comment = await Comments.findOne({
        where: { Id: commentId, PostId: postId },
      });
      if (comment.UserId !== userId) {
        return res
          .status(403)
          .json({ errorMessage: "댓글의 삭제 권한이 존재하지 않습니다." });
      }
    } catch (err) {
      console.lor(err);
      return res
        .status(404)
        .json({ errorMessage: "댓글 삭제가 정상적으로 처리되지 않았습니다." });
    }
    try {
      await Comments.destroy({
        where: {
          [Op.and]: [{ Id: commentId }],
        },
      });
      res.status(200).json({ message: "댓글이 삭제되었습니다." });
    } catch (err) {
      console.lor(err);
      res.status(400).json({ errorMessage: " 댓글 삭제에 실패하였습니다." });
    }
  }
);
module.exports = router;
