import messages from './messages/common-messages';

export default ({ test, foo }) => {
  const message = test ? messages.test : messages[foo];

  return (
    <div>
      {formatMessage(message)}
    </div>
  );
};
