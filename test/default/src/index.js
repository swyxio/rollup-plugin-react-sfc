import MyButton from './MyButton.react';
import ReactDOM from 'react-dom'

ReactDOM.render(document.getElementById('app'), 
React.createElement(MyButton) // so that rollup includes it in bundle
)