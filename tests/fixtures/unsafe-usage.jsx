import messages from './messages/common-messages';

export default ({ msg }) => (
  <div>
    {formatMessage(messages[msg])}
    {messages}
  </div>
)
