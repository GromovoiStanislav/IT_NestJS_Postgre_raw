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
    name character varying,
    "websiteUrl" character varying,
    description character varying,
    "createdAt" character varying,
    "userId" character varying,
    "userLogin" character varying,
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