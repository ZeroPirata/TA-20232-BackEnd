<br id="inicio">

<h1 align="center">API 2023.2 - The Achievers & Oracle Academy</h1>
<h3 align="center">Repositório destinado aos códigos do Back-End</h2>

 <span id="techtools">
 <h3>:hammer_and_wrench: Ferramentas e Tecnologias</h3>
 
 <p align="center">
  <img src="https://img.shields.io/badge/JavaScript-23121011?style=for-the-badge&logo=javascript&logoColor=000000&color=CED4DA"/>
  <img src="https://img.shields.io/badge/Node.js-23121011?style=for-the-badge&logo=nodedotjs&logoColor=000000&color=CED4DA"/>
  <img src="https://img.shields.io/badge/TypeScript-23121011?style=for-the-badge&logo=typescript&logoColor=000000&color=CED4DA"/> 
  <img src="https://img.shields.io/badge/MySQL-23121011?style=for-the-badge&logo=mysql&logoColor=000000&color=CED4DA"/>
  <img src="https://img.shields.io/badge/MongoDB-23121011?style=for-the-badge&logo=mongodb&logoColor=000000&color=CED4DA"/> 
</p>
 
 
 <h3>:gear: Execução do Sistema</h3>
 <p>Para rodar o projeto localmente, siga estes passos:</p>

```bash 
# Baixe o repositório ou clone usando o comando:
  git clone https://github.com/TheAchieversDSM/API-2023.2-Back-End.git
  
# Utilize a IDE desejada:
 (VS Code, Sublime, Atom etc...)

# Importe a pasta do projeto para sua IDE

# Instale as dependências do projeto, utilize o comando:
 (npm i ou npm install)
 
# Crie um banco com o nome que desejar e utilizando o SGBD que desejar
 
# Altere o arquivo ".env" para o banco que fora criado anteriormente. 
 
# Execute o projeto com o comando:
 (yarn dev ou npm run dev)
```

 <h3>:arrows_counterclockwise: Rotas do Sistema</h3>


### 📄 Tarefas

|                                                                    Tipo | Rota                                 | Ação                            |
| ----------------------------------------------------------------------: | :----------------------------------- | :------------------------------ |
| [![](https://img.shields.io/badge/POST-4682B4?style=for-the-badge)]() | `/create`                                | Cadastra uma nova tarefa|
| [![](https://img.shields.io/badge/GET-2E8B57?style=for-the-badge)]() | `/all`                                    | Busca por todos as tarefas|
| [![](https://img.shields.io/badge/GET-2E8B57?style=for-the-badge)]() | `/getById/:id`                            | Busca uma tarefa por seu Id|
| [![](https://img.shields.io/badge/GET-2E8B57?style=for-the-badge)]() | `/getExpiredTasks/:id/:date`              | Busca por todas as tarefas expiradas|
| [![](https://img.shields.io/badge/GET-2E8B57?style=for-the-badge)]() | `/getByUserId/:userId`                    | Busca por todos as tarefas de um usuário|
| [![](https://img.shields.io/badge/PUT-9370DB?style=for-the-badge)]() | `/update/:id`                             | Atualiza a Tarefa |
| [![](https://img.shields.io/badge/DELETE-CD853F?style=for-the-badge)]() | `/delete/:id`                          | Deleta uma Tarefa|

### 🪪 Usuários

|                                                                    Tipo | Rota                                 | Ação                            |
| ----------------------------------------------------------------------: | :----------------------------------- | :------------------------------ |
| [![](https://img.shields.io/badge/POST-4682B4?style=for-the-badge)]() | `/login`                                 | Autentifica um usuário na sessão|
| [![](https://img.shields.io/badge/POST-4682B4?style=for-the-badge)]() | `/create`                                | Cadastra um novo usuário|
| [![](https://img.shields.io/badge/GET-2E8B57?style=for-the-badge)]() | `/getAll`                                 | Busca por todos os usuários cadastrados|
| [![](https://img.shields.io/badge/PUT-9370DB?style=for-the-badge)]() | `/updateUser`                             | Atualiza um usuário |
| [![](https://img.shields.io/badge/DELETE-CD853F?style=for-the-badge)]() | `deleteUser`                           | Deleta um usuário|

### 📑 Subtask

|                                                                    Tipo | Rota                                 | Ação                            |
| ----------------------------------------------------------------------: | :----------------------------------- | :------------------------------ |
| [![](https://img.shields.io/badge/POST-4682B4?style=for-the-badge)]() | `/create`                                | Cadastra uma nova subtarefa|
| [![](https://img.shields.io/badge/GET-2E8B57?style=for-the-badge)]() | `/getById/:subtaskId`                     | Busca por uma subtarefa pelo seu id|
| [![](https://img.shields.io/badge/GET-2E8B57?style=for-the-badge)]() | `/getAll`                                 | Busca todas as subtarefas cadastradas|
| [![](https://img.shields.io/badge/GET-2E8B57?style=for-the-badge)]() | `ubtaskRouter.get("/getByTask/:taskId`    | Busca todas as subtarefas de uma tarefa|
| [![](https://img.shields.io/badge/PUT-9370DB?style=for-the-badge)]() | `/update/:id`                             | Atualiza a subtarefa|
| [![](https://img.shields.io/badge/DELETE-CD853F?style=for-the-badge)]() | `/delete/:id`                          | Deleta uma subtarefa|
