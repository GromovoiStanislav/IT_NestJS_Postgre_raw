DROP TABLE IF EXISTS public."Users";

CREATE TABLE public."Users"
(
    "Id" character varying,
    "Login" character varying COLLATE "C",
    "Password" character varying,
    "Email" character varying COLLATE "C",
    "CreatedAt" character varying,
    "ConfirmationCode" character varying,
    "IsEmailConfirmed" boolean,
    "recoveryCode" character varying,
    "IsRecoveryCodeConfirmed" boolean,
    "IsBanned" boolean,
    "BanDate" character varying,
    "BanReason" character varying,
    PRIMARY KEY ("Id")
);



DROP TABLE IF EXISTS public."Devices";

CREATE TABLE public.Devices
(
    "TokenId" character varying,
    "DeviceId" character varying,
    "UserId" character varying,
    "IssuedAt" character varying,
    "ExpiresIn" character varying,
    "Ip" character varying,
    "Title" character varying
);