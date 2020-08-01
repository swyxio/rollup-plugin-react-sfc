(function (react, ReactDOM) {
  'use strict';

  react = react && Object.prototype.hasOwnProperty.call(react, 'default') ? react['default'] : react;
  ReactDOM = ReactDOM && Object.prototype.hasOwnProperty.call(ReactDOM, 'default') ? ReactDOM['default'] : ReactDOM;

  var MyButton = ({onClick}) => {
    useEffect(() => console.log('rerendered')); // no need for React import
    return (
    <div>
      Some Text
      <MyButton {...{onClick}}>
        My Call To Action
      </MyButton>
    <style jsx>{`
div {
	color: red;
}
`}</style></div>
    )
  };

  ReactDOM.render(document.getElementById('app'), React.createElement(MyButton));

}(react, ReactDOM));
