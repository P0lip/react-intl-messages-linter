import messages from './messages';
import commonMessages from '../common-messages';

export default ({ text, open, msg }) => (
  <div>
    <FormattedMessage {...messages[open ? 'foo' : 'baz']} />
    {text && (
      <div>
        {intl.formatMessage(messages.bar)}
        {intl.formatMessage(commonMessages.Alert)}
      </div>
    )}
    {messages[msg]}
    {messages['safeAccess']}
  </div>
)
