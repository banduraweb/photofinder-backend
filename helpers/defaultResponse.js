const errorTypes = require("../constants/errors");

module.exports = {
  defaultResponse: (res, successStatus, payload) => {
    if (payload && payload.error) {
      const { message, code } = payload.error;
      switch (code) {
        case errorTypes.Internal:
          return res.status(500).json({ error: message });
        case errorTypes.Forbidden:
          return res.status(403).json({ error: message });
        case errorTypes.NotFound:
          return res.status(404).json({ error: message });
        case errorTypes.Exists:
          return res.status(409).json({ error: message });
        case errorTypes.Validation:
          return res.status(400).json({ error: message });
        case errorTypes.Token:
          return res.status(403).json({ error: message });
        default:
          return res.status(404).json({ error: message });
      }
    }
    return res.status(successStatus).json(payload);
  },
};
