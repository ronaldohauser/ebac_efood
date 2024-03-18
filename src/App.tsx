import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom'
import GlobalStyle from './styles';
import Footer from './components/Footer';

import Rotas from './routes'
import Cart from './components/Cart';
import { store } from './store';

//
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <GlobalStyle></GlobalStyle>
          <Rotas/>
          <Footer></Footer>
          <Cart></Cart>
        </div>    
      </BrowserRouter>
    </Provider>
  );
}

export default App;
