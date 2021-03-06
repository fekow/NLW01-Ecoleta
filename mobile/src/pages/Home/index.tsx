import React, { useState, useEffect, ChangeEvent } from 'react';
import { Feather as Icon} from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";
import { KeyboardAvoidingView, Platform, TextInput, StyleSheet, ImageBackground, Text, View, Image } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { AppLoading } from "expo";
interface Props {
  navigation: {
    navigate: any
  },
}
interface IBGEUFResponse{
  sigla: string;
}
interface IBGECityResponse{
  nome: string;
}

const Home: React.FC<Props> = ({navigation}) => {

  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [uf, setUf] = useState('0')
  const [city, setCity] = useState('0');

  useEffect(()=>{
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    .then(response=>{
      const ufInitials = response.data.map(uf=> uf.sigla)
      setUfs(ufInitials)
    })
  }, [])
  if (!ufs) {
    return <AppLoading />
  }
  useEffect(()=>{
    if (uf === '0') return;
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
    .then(response=>{
      //carregar as cidades sempre que a UF mudar
      const cityNames = response.data.map(city=> city.nome)
      setCities(cityNames)
      console.log(city)

    })
  },[uf])
  
  const placeholder1 = {
    label: 'Selecione o estado',
    value: null,
    color: '#9EA0A4',
  };
  const placeholder2 = {
    label: 'Selecione a cidade',
    value: null,
    color: '#9EA0A4',
  };
  return (
    <KeyboardAvoidingView style={{flex: 1}}behavior={Platform.OS === 'ios' ? 'padding': undefined}>
    <ImageBackground source={require('../../assets/home-background.png')} 
    imageStyle={{width: 274, height: 368}} // aplica style somente na imagem
    style={styles.container}>
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <View>
          <Text style={styles.title}>Seu marketplace de coleta de resíduos.</Text>
          <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
        </View>
        </View>
      <View style={styles.footer}>
        <RNPickerSelect
          onValueChange={(value)=>setUf(value)}
          value={uf}
          style={pickerSelectStyles}
          placeholder={placeholder1}
          items={ufs.map(uf=>{
            return { label: uf, value: uf}
          } )}
          useNativeAndroidPickerStyle={false}
        />
        <RNPickerSelect
          onValueChange={(value)=>setCity(value)}
          value={city}
          style={pickerSelectStyles}
          placeholder={placeholder2}
          items={cities.map(uf=>{
            return { label: uf, value: uf}
          } )}
          useNativeAndroidPickerStyle={false}
        />
        <RectButton 
          onPress={()=>{navigation.navigate('Points', {
            uf,
            city
          })}} 
          style={styles.button}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#fff" size={24}/>
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 60,
    fontSize: 16,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    marginBottom: 8,
    paddingHorizontal: 24,
    borderRadius: 10,
    color: '#6C6C80',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    backgroundColor: '#FFF',
    height: 60,
    fontSize: 16,
    paddingVertical: 12,
    marginBottom: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    color: '#6C6C80',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default Home;
