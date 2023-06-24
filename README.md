# Blog 백엔드 구현 프로젝트

## 🖥️ 프로젝트 소개

express와 mysql을 이용한 백엔드 프로젝트입니다

## 📌 주요 기능

#### 👌로그인 api

**POST**//<a>localhost:3018/api/login</a>

- nickname, password 항목 req.body 로 전달
- DB값 검증
- 로그인시 JWT토큰을 생성해 res.cookie로 전달

#### 👌회원가입 api

**POST**//<a>localhost:3018/api/users</a>

- nickname, password, confirmPassword, name, age, gender, profileImage를 req.body로 전달
- nickname, password는 Users에 name, age, gender, profileImage는 UserInfos에 저장
- DB값 nickname 중복 체크

#### 👌사용자 조회 api

**GET**//<a>localhost:3018/api/users/:userId</a>

#### 👌게시물조회 api

**GET**//<a>localhost:3018/api/posts</a>

- postId, title, createdAt, nickname 출력
- 날짜 내림차순
- 토큰검사 x

#### 👌게시물작성 api

**POST**//<a>localhost:3018/api/posts</a>

- jwt토큰을 이용해 검증 후 작성 가능
- title, content 를 req.body로 전달

#### 👌게시물상세조회 api

**GET**//<a>localhost:3018/api/posts/:postId</a>

- 게시물 postId를 postId의 역할로 req.param을 이용해 전달
- DB에 postId를 매칭해 res.json으로 전달

#### 👌게시물수정 api

**PUT**//<a>localhost:3018/api/posts/:postId</a>

- 수정할 게시물 postId를 postId의 역할로 req.param을 이용해 전달
- DB에 postId를 매칭해 데이터 전달
- 데이터의 uesrId값과 locals.user의 uesrId값을 검증

#### 👌게시물삭제 api

**DELETE**//<a>localhost:3018/api/posts/:postId</a>

- 삭제할 게시물 postId를 postId의 역할로 req.param을 이용해 전달
- DB에 postId를 매칭해 데이터 전달
- 데이터의 uesrId값과 locals.user의 uesrId값을 검증
