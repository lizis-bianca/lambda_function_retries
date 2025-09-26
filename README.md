# lambda_function_retries
Modelo de um pequeno ecossistema de micro-serviços desenvolvido com javascript, utilizando técnicas de mensageria para integração de serviços (funções lambda) separados.
Estes conceitos, de uma forma geral e bem simplificada, devem ser utilizados para a concepção de futuras aplicações a serem desenvolvidas.

## Conceito
O conceito deste pequeno projeto é apenas demonstrar como funções serverless, deployadas em locais distintos, se comunicam por meio do AWS SNS, utilizando técnicas de mensageria.
---
## Realizar o deploy de funções lambda

### Checagens de rotina e build
```sh
# validar o template da função lambda
sam validate

# compilar a função, se necessário
sam build
```
---
## Inscrever uma função lambda em um topico SNS
Para inscrever uma função Lambda em um tópico do AWS SNS, siga os seguintes passos:

1. Abra o console da AWS e navegue até o serviço SNS.
2. Na página inicial do SNS, selecione o tópico ao qual deseja inscrever a função Lambda.
3. Clique no botão "Inscrições" e selecione "Criar inscrição".
4. Escolha o tipo de protocolo "AWS Lambda" e selecione a função Lambda que deseja inscrever.
5. Clique em "Criar inscrição" para concluir o processo de inscrição.

A partir de agora, a função Lambda estará inscrita no tópico do SNS e será acionada sempre que uma mensagem for publicada nesse tópico. Para testar a inscrição, você pode publicar uma mensagem no tópico do SNS e verificar se a função Lambda é executada.

## Utilitários

Executando uma função lambda com um servidor HTTP:
```sh
sam local start-api
```

Invocando uma função lambda com um evento do AWS SNS:
```sh
# 1 - iniciando o SAM localmente
sam local start-lambda
```
# 1 - iniciando o SAM localmente
sam local start-lambda
