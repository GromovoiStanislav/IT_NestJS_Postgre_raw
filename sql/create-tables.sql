DROP TABLE IF EXISTS public."users";

CREATE TABLE public."users"
(
    "id" character varying  NOT NULL,
    "login" character varying COLLATE "C",
    "password" character varying,
    "email" character varying COLLATE "C",
    "createdAt" character varying COLLATE "C",
    "confirmationCode" character varying,
    "isEmailConfirmed" boolean,
    "recoveryCode" character varying,
    "isRecoveryCodeConfirmed" boolean,
    "isBanned" boolean,
    "banDate" character varying,
    "banReason" character varying,
    PRIMARY KEY ("id")
);



DROP TABLE IF EXISTS public."devices";

CREATE TABLE public.devices
(
    "tokenId" character varying,
    "deviceId" character varying,
    "userId" character varying,
    "issuedAt" character varying,
    "expiresIn" character varying,
    "ip" character varying,
    "title" character varying
);



DROP TABLE IF EXISTS public."blogs";

CREATE TABLE public.blogs
(
    id character varying NOT NULL,
    name character varying COLLATE "C",
    "websiteUrl" character varying COLLATE "C",
    description character varying COLLATE "C",
    "createdAt" character varying COLLATE "C",
    "userId" character varying,
    "userLogin" character varying COLLATE "C",
    "isBanned" boolean,
    "banDate" character varying,
    PRIMARY KEY (id)
);


DROP TABLE IF EXISTS public."blogBannedUsers";

CREATE TABLE public."blogBannedUsers"
(
    "blogId" character varying,
    "userId" character varying,
    login character varying,
    "createdAt" character varying,
    "banReason" character varying
);


DROP TABLE IF EXISTS public."posts";

CREATE TABLE public.posts
(
    id character varying NOT NULL,
    title character varying COLLATE "C",
    content character varying COLLATE "C",
    "shortDescription" character varying COLLATE "C",
    "blogId" character varying,
    "blogName" character varying,
    "createdAt" character varying COLLATE "C",
    PRIMARY KEY (id)
);


DROP TABLE IF EXISTS public."postLikes";

CREATE TABLE public."postLikes"
(
    "postId" character varying,
    "userId" character varying,
    "userLogin" character varying,
    "likeStatus" character varying,
    "addedAt" character varying COLLATE "C"
);



DROP TABLE IF EXISTS public."comments";

CREATE TABLE public.comments
(
    id character varying NOT NULL,
    "postId" character varying,
    content character varying COLLATE "C",
    "userId" character varying,
    "userLogin" character varying COLLATE "C",
    "createdAt" character varying COLLATE "C",
    PRIMARY KEY (id)
);


DROP TABLE IF EXISTS public."commentLikes";

CREATE TABLE public."commentLikes"
(
    "commentId" character varying,
    "userId" character varying,
    "likeStatus" character varying
);