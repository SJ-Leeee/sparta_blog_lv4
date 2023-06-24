const express = require("express");
const { Users, UserInfos } = require("../models");
const router = express.Router();
const jwt = require("jsonwebtoken");
// 로그인
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;
  const user = await Users.findOne({ where: { nickname } });
  if (!user) {
    return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
  } else if (user.password !== password) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  const token = jwt.sign(
    {
      userId: user.userId,
    },
    "customized_secret_key"
  );
  res.cookie("authorization", `Bearer ${token}`);
  return res.status(200).json({ message: "로그인 성공", userId: user.userId });
});

// 회원가입
router.post("/users", async (req, res) => {
  const {
    nickname,
    password,
    confirmPassword,
    name,
    age,
    gender,
    profileImage,
  } = req.body;

  const regex = /^[a-zA-Z0-9]{3,}$/;
  const idCheck = regex.test(nickname);

  if (!idCheck) {
    res.status(400).json({
      errorMessage:
        "nickname을 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9) 으로 작성하세요",
    });
    return;
  }

  if (password.length < 4 || password.includes(nickname)) {
    res.status(400).json({
      errorMessage:
        "password를 nickname 을 포함하지 않으면서 최소 4자 이상으로 작성하세요",
    });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({
      errorMessage: "password가 confirmPassword과 다릅니다.",
    });
    return;
  }

  const isExistUser = await Users.findOne({ where: { nickname } });

  if (isExistUser) {
    return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
  }

  // Users 테이블에 사용자를 추가합니다.
  const user = await Users.create({ nickname, password });
  // UserInfos 테이블에 사용자 정보를 추가합니다.
  const userInfo = await UserInfos.create({
    UserId: user.userId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
    name,
    age,
    gender: gender.toUpperCase(), // 성별을 대문자로 변환합니다.
    profileImage,
  });

  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

// 사용자 조회
router.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  const user = await Users.findOne({
    attributes: ["userId", "nickname", "createdAt", "updatedAt"],
    include: [
      {
        model: UserInfos, // 1:1 관계를 맺고있는 UserInfos 테이블을 조회합니다.
        attributes: ["name", "age", "gender", "profileImage"],
      },
    ],
    where: { userId },
  });

  return res.status(200).json({ data: user });
});
module.exports = router;
