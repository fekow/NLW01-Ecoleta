import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import './styles.css';
import { FiUpload } from "react-icons/fi";
import background from '../../assets/home-background.png'

interface Props {
  onFileUploaded:  (file: File) => void // função que recebe um item file de tipo File(js) e nao retorna nada
}

const Dropzone: React.FC<Props> = ({onFileUploaded}) => {

  const [selectedFileUrl, setSelectedFileUrl] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0]

    const fileUrl = URL.createObjectURL(file) // crio uma url pra imagem usando URL do JS

    setSelectedFileUrl(fileUrl);

    onFileUploaded(file);
  }, [onFileUploaded])
  
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: 'image/jpeg, image/pjpeg, image/png'
  })
  // se precisar de mais imagens mandar prop multiple pro input
  return (
    <div className="dropzone" style={{background: `url(${background})  #E1FAEC no-repeat`}} {...getRootProps()}>
      <input {...getInputProps()} accept='image/jpeg, image/pjpeg, image/png' />
      {selectedFileUrl 
        ? <img src={selectedFileUrl} alt="point thumbnail" />  
        : isDragActive ?
            <>
              <p>Arraste sua imagem aqui.<FiUpload /></p>
              
              </> :
            <>
              <p><h2 style={{textAlign:"center"}}>Imagem do estabelecimento</h2>
              <br/>Clique aqui ou arraste uma imagem para fazer upload (max: 2Mb)<FiUpload /></p>
            </>
      }
    </div>
  )
}

export default Dropzone