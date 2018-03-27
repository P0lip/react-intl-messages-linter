import messages from 'dynamic-messages/messages';
import warningMessages from './messages/common-messages';

export default () => {
  {
    const warningMessages = [];
  }

  return (
    <Fragment>
      {formatMessage(warningMessages.Alert)}
      <span>{formatMessage(messages.Foo)}</span>
    </Fragment>
  );
};
