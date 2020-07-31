(function () {
  'use strict';

  var MyButton = {
    RENDER({onClick}) {
      useEffect(() => console.log('rerendered')); // no need for React import
      return (
      <div>
        Some Text
        <MyButton {...{onClick}}>
          My Call To Action
        </MyButton>
      </div>
      )
    }
  };

  console.log(MyButton);

}());
