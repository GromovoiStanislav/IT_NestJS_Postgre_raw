DROP TABLE IF EXISTS public."users";

CREATE TABLE public."users"
(
    "id" character varying,
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