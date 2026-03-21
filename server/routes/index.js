const { Router } = require("express");
const {
  getMessagesByContact,
  postMessageToContact,
  getInbox,
} = require("../controllers/messages");
const { logger, maskInternalErrors } = require("../middlewares");
const { strictAuthenticate } = require("../middlewares");
const { validateId } = require("../middlewares");

const contacts = Router();
const contactId = Router({ mergeParams: true });
contacts.use("/:contactId", logger, validateId("contactId"), logger, contactId);
contactId
  .route("/messages")
  .get(getMessagesByContact)
  .post(postMessageToContact);

const inbox = Router();
inbox.get("/", getInbox);

const index = Router();
index.use(strictAuthenticate);
index.use("/contacts", contacts);
index.use("/inbox", inbox);
index.use(maskInternalErrors);

module.exports = index;
