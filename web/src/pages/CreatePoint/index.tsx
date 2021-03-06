import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from 'leaflet';
import { Link, useHistory } from 'react-router-dom';
import Dropzone from '../../components/Dropzone'
import axios from 'axios';
import './styles.css';
import logo from '../../assets/logo.svg';
import api from '../../services/api';

/* sempre que cria um estado pra um array ou objeto, precisa manualmente 
informar o tipo da variavel que vai ser armazenada */

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface IBGEUFResponse{
  sigla: string;
}
interface IBGECityResponse{
  nome: string;
}
// ali delimito a tipagem, e coloco [] pra dizer q e array,posso usar Array(Item) tb
const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0])
  const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0])
  const [selectedFile, setSelectedFile] = useState<File>();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0');

  const[finished, setFinished] = useState(false)

  const history = useHistory();

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(position=> {
      const {latitude, longitude} = position.coords
      setInitialPosition([latitude,longitude])
    })
  },[])

  useEffect(()=>{
    api.get(`/items`).then(response=>
      setItems(response.data)
      )
  }, [])

  useEffect(()=>{
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    .then(response=>{
      const ufInitials = response.data.map(uf=> uf.sigla)
      setUfs(ufInitials)
    })
  }, [])

  useEffect(()=>{
    if (selectedUf === '0') return;
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
    .then(response=>{
      //carregar as cidades sempre que a UF mudar
      const cityNames = response.data.map(city=> city.nome)
      setCities(cityNames)
    })
  },[selectedUf])


  //typescript pega o tipo de evento do react e o tipo de evento html
  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value)
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  function handleSelectItem(id: number) {
    const isSelected = selectedItems.includes(id)
    if (isSelected) {
      const filteredItems = selectedItems.filter(i=>i !== id)
      setSelectedItems(filteredItems)
    }else {
    setSelectedItems([...selectedItems,id])
    }
  }

  async function handleSubmit(event: FormEvent) {
    
    event.preventDefault();

    const {name, email, whatsapp} = formData;
    const [latitude, longitude] = selectedPosition
    const uf = selectedUf
    const city = selectedCity
    const items = selectedItems
 
    const data = new FormData(); // preciso desse formdata e append pra criar
    // string é o nome e depois é a info em si.
    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('city', city);
    data.append('uf', uf);
    data.append('items', items.join(',')); // nao posso mandar array, ja decodifico no backend

    if (selectedFile) {
      data.append('image', selectedFile)
    }

    await api.post('points', data)
    setFinished(true)
    setTimeout(() => {
      history.push('/')
    }, 2000);
  }

  return (
    <div id="page-create-point">
        {
          finished ? <div id="finished"><FiCheckCircle color="#34CB79" size={60}/> 
          <h1>Cadastro concluído!</h1>
         </div> : null
        }
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Voltar para Home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Cadastro do<br /> ponto de coleta</h1>
        <Dropzone onFileUploaded={setSelectedFile} />
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              required
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input 
              required
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input 
              required
              type="text"
              name="whatsapp"
              id="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
            />
          </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select 
                onChange={handleSelectUf} 
                value={selectedUf} 
                name="uf" 
                id="uf"
                required
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf=><option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                required
                onChange={handleSelectCity}
                name="city" 
                id="city"
                value={selectedCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map(city=><option key={city}value={city}>{city}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Items de coleta</h2>
            <span>Selecione um ou mais items abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item=>(
              <li 
                className={selectedItems.includes(item.id)? 'selected': ''}
                key={item.id} 
                onClick={() => handleSelectItem(item.id)}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>  
  )
}

export default CreatePoint;
