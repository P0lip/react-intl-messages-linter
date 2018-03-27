import messages from './messages/common-messages';

export default ({ msg, test }) => (
  <div>
    {messages[msg] ? formatMessage(messages[msg]) : null}
    {messages[msg] ? <FormattedMessage {...messages[msg]} /> : null}
    {messages[msg] ? formatMessage(messages[test]) : formatMessage(messages.foo)}
    {messages[test] && formatMessage(messages[test])}
  </div>
)
