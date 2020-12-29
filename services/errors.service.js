class SystemError {
  static error(message, code) {
    return { error: { message, code } };
  }
}

module.exports = SystemError;
