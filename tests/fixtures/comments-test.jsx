export default ({ msg, test }) => (
  <div>
    {// lint-messages-disable-next-line
      formatMessage(messages[test])
    }
    <FormattedMessage {...messages.sh} />
    {
      formatMessage(commonMessages.test) // lint-messages-disable-line
    }
    {messages[test] && // lint-messages-disable-line
      formatMessage(messages[test])
    }
  </div>
)
