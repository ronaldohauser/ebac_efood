import {
  Button,
  CartContainer,
  CartItem,
  InputGroup,
  Overlay,
  Prices,
  Sidebar,
  Title
} from "./styles"
  
import { RootReducer } from '../../store'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import {close, remove, clear} from '../../store/reducers/cart'
import { useFormik } from 'formik'
import { usePurchaseMutation } from '../../services/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const formataPreco = (preco = 0) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(preco)
}

const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

const formatCardNumber = (value: string) => {
  const numericValue = value.replace(/\D/g, '');
  const limitedValue = numericValue.slice(0, 16);
  const formattedValue = limitedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
  return formattedValue;
};



const formatCVV = (value: string) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 3);
};
  
const Cart = () => {

  const {isOpen, items} = useSelector((state: RootReducer) => state.cart)
  const [purchase, { data, isSuccess }] = usePurchaseMutation()
  const [cart, setCart] = useState(true)   
  const [purchaseData, setPurchaseData] = useState(false)  
  const [paymentData, setPaymentData] = useState(false)  
  const [checkout, setCheckout] = useState(false) 
  const [, setEmptyCart] = useState(false)   
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const closeCart = () => {
    dispatch(close())
}

const removeItem = (id: number) =>{
  dispatch(remove(id))
}

const getTotal = () => {
  return items.reduce((acumulador, valorAtual) => {
    return (acumulador += valorAtual.preco)
  }, 0)
}

const form = useFormik({
  initialValues: {
    fullName: '',
    address: '',
    city: '',
    CEP: '',
    number: '',
    reference: '',
    cardName: '',
    cardNumber: '',
    cvv: '',
    expiresMonth: '',
    expiresYear:'',        
  },
  validationSchema: Yup.object({
    fullName: Yup.string().min(8, 'Mínimo 8 caracteres').required('Obrigatório'),
    address: Yup.string().min(8, 'Mínimo 8 caracteres').required('Obrigatório'),
    city: Yup.string().min(4, 'Mínimo 4 caracteres').required('Obrigatório'),
    CEP: Yup.string().matches(/^\d{5}-\d{3}$/, 'Formato inválido').required('Obrigatório'),
    number: Yup.number().min(2, 'Mínimo 2 caracteres').required('Obrigatório'),
    cardName: Yup.string().min(8, 'Mínimo 8 caracteres').required('Obrigatório'),
    cardNumber: Yup.string().matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Formato inválido').required('Obrigatório'),
    cvv: Yup.number().min(3, 'Mínimo 3 caracteres').required('Obrigatório'),
    expiresMonth: Yup.string().matches(/^(0[1-9]|1[0-2])$/, 'Mês inválido').required('Obrigatório'),
    expiresYear: Yup.string().matches(/^\d{4}$/, 'Ano inválido').required('Obrigatório'),
  }),
  onSubmit: (values) => {
    console.log(values)
    purchase({
      products: [{
        id: 1,
        price: 10
      }],
      delivery: {
        receiver: values.fullName,
        adress: {
          description: values.address,
          city: values.city,
          zipCode: values.CEP,
          number: Number(values.number),
          complement: values.reference
        }
      },
      payment: {
        card: {
          name: values.cardName,
          number: values.cardNumber,
          code: Number(values.cvv),
          expires: {
            month: Number(values.expiresMonth),
            year: Number(values.expiresYear)
          }
        }
      }
    })
  }
})
const checkInput = (fieldName: string) => {
  const isTouched = fieldName in form.touched
  const isInvalid = fieldName in form.errors
  const hasError = isTouched && isInvalid

  return hasError
}

    const goToPurchase = () => {
      setCart(false)
      setPurchaseData(true)
    }

    const backToCart = () => {
      setCart(true)
      setPurchaseData(false)
      setPaymentData(false)
      setCheckout(false)
    }

    const goToPayment = () => {
      
      if(!form.errors.fullName &&
        !form.errors.address &&
        !form.errors.city && 
        !form.errors.CEP &&
        !form.errors.number){
          setPurchaseData(false)
          setPaymentData(true)          
      }
    }     

    const backToPurchase = () => {
      setPaymentData(false)
      setPurchaseData(true)
    }
    
    const goToCheckout = () => {     

      if(!form.errors.cardName && !form.errors.cardNumber && !form.errors.cvv && !form.errors.expiresMonth && !form.errors.expiresYear){
        setPaymentData(false)
        setCheckout(true)
        dispatch(clear())        
      }
    }

    const finishPurchase = () => {
      setCart(true)
      setCheckout(false)
      closeCart()
      setEmptyCart(false)
      navigate('/')
    }


  
    return (
      <CartContainer className={isOpen ? 'is-open' : ''}>        
          <Overlay onClick={closeCart}/>
          <Sidebar className={cart ? '' : 'is-closed'}>
        {items.length < 1 ? (
            <div>
              <Title>Carrinho vazio</Title>
            </div>
        ) : (
              <ul>
                {items.map((item) => (
                  <CartItem key={item.id}>
                    <img src={item.foto} alt={item.nome}/>
                    <div>
                      <h3>{item.nome}</h3>
                      <span>{formataPreco(item.preco)}</span>
                    </div>
                    <button onClick={() => removeItem(item.id)}/>
                  </CartItem>
                ))}
              </ul>
        )}
              <Prices>
                Valor total <span>{formataPreco(getTotal())}</span>                
              </Prices>
              <Button onClick={goToPurchase}>Continuar com a entrega</Button>                    
          </Sidebar>
        <Sidebar className={purchaseData ? '' : 'is-closed'}>
            <Title>Entrega</Title>
            <form className='margin-bottom' onSubmit={form.handleSubmit}>
              <div>
                <label htmlFor="fullName">Quem irá receber</label>
                <input type="text" name='fullName' id='fullName' onChange={form.handleChange}
                    onBlur={form.handleBlur} className={checkInput('fullName') ? 'error' : ''} required/>
              </div>
              <div>
                <label htmlFor="address">Endereço</label>
                <input type="text" name='address' id='address' onChange={form.handleChange}
                    onBlur={form.handleBlur} className={checkInput('address') ? 'error' : ''}/>
              </div>
              <div>
                <label htmlFor="city">Cidade</label>
                <input type="text" name='city' id='city' onChange={form.handleChange}
                    onBlur={form.handleBlur} className={checkInput('city') ? 'error' : ''}/>
              </div>
              <InputGroup>
                <div>
                  <label htmlFor="CEP">CEP</label>
                  <input type="text" name='CEP' id='CEP' onChange={(e) => form.setFieldValue('CEP', formatCEP(e.target.value))}
                    onBlur={form.handleBlur} className={checkInput('CEP') ? 'error' : ''}/>
                </div>
                <div>
                  <label htmlFor="number">Número</label>
                  <input type="text" name='number' id='number' onChange={form.handleChange}
                    onBlur={form.handleBlur} className={checkInput('number') ? 'error' : ''}/>
                </div>
              </InputGroup>
              <div>
                  <label htmlFor="reference">Complemento (opcional)</label>
                  <input type="text" name='reference' id='reference' onChange={form.handleChange}
                    onBlur={form.handleBlur} />
              </div>
            </form>
              {form.dirty ? (<Button type='button' onClick={goToPayment}>Continuar com pagamento</Button>) : ''}              
              <Button type='button' onClick={backToCart}>Voltar para carrinho</Button>
        </Sidebar>
        <Sidebar className={paymentData ? '' : 'is-closed'}>
            <Title>Pagamento - Valor a pagar {formataPreco(getTotal())}</Title>
            <form onSubmit={form.handleSubmit}>
              <div>
                <label htmlFor="cardName">Nome no cartão</label>
                <input type="text" name='cardName' id='cardName' onChange={form.handleChange}
                    onBlur={form.handleBlur} className={checkInput('cardName') ? 'error' : ''}/>
              </div>
              <InputGroup>
                <div>
                  <label htmlFor="cardNumber">Número do cartão</label>
                  <input type="text" name='cardNumber' id='cardNumber' onChange={(e) => form.setFieldValue('cardNumber', formatCardNumber(e.target.value))}
                    onBlur={form.handleBlur} className={checkInput('cardNumber') ? 'error' : ''}/>
                </div>
                <div>
                  <label htmlFor="cvv">CVV</label>
                  <input type="text" name='cvv' id='cvv' onChange={(e) => form.setFieldValue('cvv', formatCVV(e.target.value))}
                    onBlur={form.handleBlur} className={checkInput('cvv') ? 'error' : ''}/>
                </div>
              </InputGroup>
              <InputGroup>
                <div>
                  <label htmlFor="expiresMonth">Mês de vencimento</label>
                  <input type="text" name='expiresMonth' id='expiresMonth'onChange={form.handleChange}
                    onBlur={form.handleBlur}  className={checkInput('expiresMonth') ? 'error' : ''}/>
                </div>
                <div>
                  <label htmlFor="expiresYear">Ano de vencimento</label>
                  <input type="text" name='expiresYear' id='expiresYear'onChange={form.handleChange}
                    onBlur={form.handleBlur} className={checkInput('expiresYear') ? 'error' : ''}/>
                </div>
              </InputGroup>
              <Button type='submit' className='margin-top' onClick={goToCheckout}>Finalizar pagamento</Button>
              <Button type='button' onClick={backToPurchase}>Voltar para a edição de endereço</Button>
            </form>
        </Sidebar>
        {isSuccess ? (
          <Sidebar className={checkout ? '' : 'is-closed'}>
            <Title>Pedido realizado - {data.orderId}</Title>
            <p>
              Estamos felizes em informar que seu pedido já está em processo de preparação e, em breve, será entregue no endereço fornecido.
            </p>
            <p>
              Gostaríamos de ressaltar que nossos entregadores não estão autorizados a realizar cobranças extras. 
            </p>
            <p> 
              Lembre-se da importância de higienizar as mãos após o recebimento do pedido, garantindo assim sua segurança e bem-estar durante a refeição.
            </p>
            <p>
              Esperamos que desfrute de uma deliciosa e agradável experiência gastronômica. Bom apetite!
            </p>
            <Button className='margin-top' onClick={finishPurchase}>Concluir</Button>          
          </Sidebar>
        ) : (
          <Sidebar className={checkout ? '' : 'is-closed'}>
            <h3 >Erro na transação</h3>
          </Sidebar>
          
        )}
      </CartContainer>
    )
  }
  
  export default Cart
