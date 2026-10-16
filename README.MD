# ⚽ Street Football 3D

Jogo de futebol arcade em 3D, feito para navegador, com partidas rápidas de 1 contra 1, controles para PC e celular, goleiros, inteligência artificial adversária e progressão de carreira.

## 📖 Sobre o jogo

**Street Football 3D** coloca você em uma partida rápida de futebol: controle seu jogador, dispute a posse da bola, tente marcar mais gols que o adversário e acumule moedas para melhorar suas habilidades.

- **Gênero:** Futebol arcade / esporte
- **Perspectiva:** 3D
- **Modo:** Jogador contra adversário controlado pelo computador (1v1)
- **Duração da partida:** 90 segundos
- **Tecnologia 3D:** Three.js
- **Idioma:** Português

## 🎮 Recursos

- Campo 3D com marcações, gols, rede e iluminação.
- Jogadores 3D com animações de movimento.
- Bola com movimento, quique, atrito e colisões básicas.
- Goleiros com movimentação lateral e tentativas de defesa.
- Adversário controlado por IA que persegue a bola, avança em direção ao gol e tenta chutar.
- Níveis de dificuldade para ajustar o desafio.
- Placar e cronômetro durante a partida.
- Pausa, retomada e retorno ao menu.
- Efeitos de partículas quando sai um gol.
- Controles de teclado e controles por toque para dispositivos móveis.
- Estatísticas de carreira: partidas, vitórias, derrotas, empates, gols e recorde de gols em uma partida.
- Moedas de recompensa ao terminar partidas.
- Melhorias compráveis de velocidade e força do chute.
- Salvamento local do progresso no navegador.

## 💻 Requisitos

Para executar o projeto localmente, você precisará de:

- [Node.js](https://nodejs.org/) e npm.
- Um navegador moderno com suporte a WebGL.
- Os arquivos do projeto, incluindo `index.html`, `src/main.js`, `src/style.css` e a configuração do Vite (`package.json`).

## 🚀 Como executar

Execute os comandos abaixo na pasta raiz do projeto, onde está o arquivo `package.json`.

### 1. Instalar as dependências

```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

### 3. Abrir o jogo

Abra no navegador o endereço local exibido no terminal pelo Vite.

> **Observação:** os comandos pressupõem que o projeto tenha o Vite e os scripts correspondentes configurados no `package.json`.

## 🕹️ Controles

### PC

| Ação | Controle |
|---|---|
| Mover para cima | `W` ou `↑` |
| Mover para baixo | `S` ou `↓` |
| Mover para a esquerda | `A` ou `←` |
| Mover para a direita | `D` ou `→` |
| Correr | `Shift` |
| Chutar | `Espaço` |
| Pausar ou retomar | `Esc` ou `P` |

### 📱 Celular

- **Joystick virtual:** movimenta o jogador.
- **Correr:** mantenha pressionado o botão de corrida.
- **Chutar:** toque no botão de chute quando estiver perto da bola.
- **Pausar:** use o botão de pausa na interface.

Os controles móveis dependem de os elementos correspondentes estarem presentes no `index.html`.

## ⚽ Como jogar

1. Abra o jogo e escolha a dificuldade.
2. Pressione **Jogar agora**.
3. Movimente-se até a bola e aproxime-se dela.
4. Aponte seu jogador para a direção desejada.
5. Chute quando estiver ao alcance da bola.
6. Marque mais gols que o adversário antes de o cronômetro chegar a zero.
7. Ao terminar a partida, confira o resultado e as recompensas.
8. Use suas moedas no menu para comprar melhorias, quando disponíveis.

### 💡 Dicas

- Aproxime-se da bola antes de chutar.
- Vire o jogador em direção ao gol adversário para melhorar a direção do chute.
- Use a corrida para alcançar a bola mais rapidamente.
- Observe o posicionamento do goleiro antes de tentar marcar.
- Experimente diferentes níveis de dificuldade para encontrar o desafio ideal.

## 🏆 Carreira, moedas e melhorias

O jogo utiliza o armazenamento local (`localStorage`) do navegador para guardar o progresso, usando a chave `streetFootball3DStats`.

A carreira pode incluir:

- Total de partidas disputadas.
- Vitórias, derrotas e empates.
- Total de gols marcados.
- Recorde de gols em uma única partida.
- Saldo de moedas.
- Nível de melhoria de velocidade.
- Nível de melhoria de chute.

As partidas podem conceder moedas de acordo com o resultado e os gols marcados. As moedas podem ser utilizadas para comprar melhorias de **Velocidade** e **Chute**, conforme implementado na versão do jogo.

### 💾 Salvamento do progresso

- O progresso fica salvo no navegador e no perfil utilizado para jogar.
- Limpar os dados do site ou o armazenamento local pode apagar a carreira.
- O progresso local não é sincronizado automaticamente entre navegadores ou dispositivos.
- O salvamento local não substitui um sistema de contas ou armazenamento em servidor.

## 📁 Estrutura do projeto

```text
street-football-3d/
├── index.html
├── package.json
└── src/
    ├── main.js
    └── style.css
```

A estrutura real pode incluir outros arquivos de configuração, como `vite.config.js`, além de arquivos de dependências e recursos visuais.

## 🛠️ Tecnologias utilizadas

- **JavaScript (ES Modules):** lógica da partida, controles, IA e progressão.
- **Three.js:** cena 3D, câmera, modelos geométricos, iluminação e renderização.
- **HTML:** estrutura da interface.
- **CSS:** aparência, layout e adaptação da interface a diferentes telas.
- **localStorage:** persistência local das estatísticas e melhorias.
- **Vite (se configurado no projeto):** servidor de desenvolvimento e empacotamento.

## 🧰 Solução de problemas

### A tela do jogo fica vazia

- Confira se o servidor de desenvolvimento iniciou sem erros.
- Verifique o console do navegador em busca de erros de JavaScript.
- Confirme que o navegador suporta WebGL.
- Confira se o `index.html` contém o elemento `#game`.

### Erro ao importar Three.js

Execute `npm install` na pasta raiz e confirme que `three` está listado nas dependências do `package.json`.

### Os botões ou controles móveis não funcionam

Confira se os IDs dos elementos no `index.html` correspondem aos utilizados em `src/main.js`, incluindo os botões de início, pausa, chute, corrida e joystick.

### As estatísticas não aparecem ou não são salvas

Verifique se o navegador permite `localStorage` para o endereço em que o jogo está sendo executado. O modo privado ou configurações restritivas podem limitar o armazenamento.

### O jogo está lento

- Feche abas pesadas e outros aplicativos.
- Utilize um navegador atualizado.
- Verifique o desempenho do dispositivo.
- Lembre-se de que o jogo utiliza renderização 3D em tempo real.

## 📌 Estado do projeto

**Street Football 3D** é um projeto de futebol arcade em desenvolvimento. A física, a inteligência artificial, as animações e o equilíbrio da dificuldade são simplificados para priorizar partidas rápidas e acessíveis.

## 🔮 Ideias para futuras atualizações

- Mais arenas e estilos de campo.
- Personalização visual do jogador.
- Novos níveis de melhoria e itens cosméticos.
- Sons de chute, torcida e apito.
- Mais tipos de adversários e comportamentos de IA.
- Opção para reiniciar a carreira pelo menu.
- Suporte a controles físicos e gamepads.
- Melhorias de acessibilidade e opções gráficas.
- Modo multiplayer online.

## 👨‍💻 Créditos

Projeto independente desenvolvido com JavaScript e Three.js.
