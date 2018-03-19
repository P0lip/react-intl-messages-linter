import foo from './bar';

export default ({ text, open, msg }) => (
  <div>
    <FormattedMessage {...messages[open ? 'foo' : 'baz']} />
    {text && (
      <div>
        {intl.formatMessage(messages.bar)}
      </div>
    )}
    {messages[msg]}
    {messages['safeAccess']}
  </div>
)
