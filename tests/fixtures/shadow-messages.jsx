import messages from 'dynamic-messages/messages';

export default () => {
  const warningMessages = [];
  return (
    <Fragment>
      {warningMessages[0]}
      <span>{messages.Foo}</span>
    </Fragment>
  );
};
