import messages from './messages';
import commonMessages from '../messages/common-messages';

export default ({ text, open, msg }) => (
  <div>
    <FormattedMessage {...messages[open ? 'foo' : 'baz']} />
    {text && (
      <div>
        {intl.formatMessage(messages.bar)}
        {intl.formatMessage(commonMessages.Alert)}
      </div>
    )}
    {formatMessage(messages[msg])}
    {formatMessage(messages['safeAccess'])}
  </div>
)
