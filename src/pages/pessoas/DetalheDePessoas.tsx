import { useNavigate, useParams } from 'react-router-dom'
import { FormHandles } from '@unform/core'
import { Form } from '@unform/web'

import { LayoutBaseDePagina } from '../../shared/layouts'
import { FerramentasDeDetalhe } from '../../shared/components/ferramentas-de-detalhe/FerramentasDeDetalhe'
import { useEffect, useRef, useState } from 'react'
import { PessoasService } from '../../shared/services/api/pessoas/PessoasService'
import { VTextField } from '../../shared/forms'

interface IFormData {
  email: string
  cidadeId: number
  nomeCompleto: string
}

export const DetalheDePessoas: React.FC = () => {
  const { id = 'nova' } = useParams<'id'>()
  const navigate = useNavigate()

  const formRef = useRef<FormHandles>(null)

  const [, setIsLoading] = useState(false)
  const [nome, setNome] = useState('')

  useEffect(() => {
    if (id !== 'nova') {
      setIsLoading(true)

      PessoasService.getById(Number(id))
        .then((result) => {
          setIsLoading(false)

          if (result instanceof Error) {
            alert(result.message)
            navigate('/pessoas')
          } else {
            setNome(result.nomeCompleto)
            formRef.current?.setData(result)
          }
        })
    }
  }, [id])

  const handleSave = (dados: IFormData) => {
    setIsLoading(true)

    if (id === 'nova') {
      PessoasService
        .create(dados)
        .then((result) => {
          setIsLoading(false)

          if (result instanceof Error) {
            alert(result.message)
          } else {
            navigate(`/pessoas/detalhe/${result}`)
          }
        })
    } else {
      PessoasService
        .updateById(Number(id), { id: Number(id), ...dados})
        .then((result) => {
          setIsLoading(false)

          if (result instanceof Error) {
            alert(result.message)
          } 
        })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Realmente deseja apagar?')) {
      PessoasService.deleteById(id).then((result) => {
        if (result instanceof Error) {
          alert(result.message)
        } else {
          alert('Registro apagado com sucesso!')
          navigate('/pessoas')
        }
      })
    }
  }

  return (
    <LayoutBaseDePagina
      titulo={id === 'nova' ? 'Nova pessoa' : nome}
      barraDeFerramentas={
        <FerramentasDeDetalhe 
          textoBotaoNovo='Nova'
          mostrarBotaoSalvarEFechar
          mostrarBotaoNovo={id !== 'nova'}
          mostrarBotaoApagar={id !== 'nova'}

          aoClicarEmApagar={() => handleDelete(Number(id))}
          aoClicarEmSalvar={() => formRef.current?.submitForm()}
          aoClicarEmNovo={() => navigate('/pessoas')}
          aoClicarEmVoltar={() => navigate('pessoas/detalhe/nova')}
          aoClicarEmSalvarEFechar={() => formRef.current?.submitForm()}
        />
      }
    >

      <Form ref={formRef} onSubmit={handleSave}>
        <VTextField placeholder='Nome completo' name='nomeCompleto'/>
        <VTextField placeholder='Email' name='email'/>
        <VTextField placeholder='Cidade id' name='cidadeId'/>
      </Form>
      
    </LayoutBaseDePagina>
  )
}