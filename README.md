<h1 align='center'>Serverless API</h1>

## **Explanation and examples 📚**

[https://docs.google.com/document/d/1NSc4-eij6NaD4SgGQdHEi-wkPiO992at97-PzkDMqxs](https://docs.google.com/document/d/1NSc4-eij6NaD4SgGQdHEi-wkPiO992at97-PzkDMqxs)

<br/><br/>

## **Installing and Running 📦**

Please use **yarn** instead of npm and don't push **package-lock.json** to this repo.

1. Clone Template

```
git clone <repo-link>
```

<br/>

2. If you don't have Serverless globally in your machine, please install it (only use npm at this time):

```
npm install -g serverless
```

<br/>

3. Install Packages

```
yarn install
```

<br/>

4. Configs environment variables

- Create a new **.env** file with same structure as **.env.example**
- Fill in your configs information in the **.env** file.

<br/>

5. Start Project

```
yarn dev
```

or

```
sls offline start
```

or

```
serverless offline start
```

<br/><br/>

## **Debugging 🔬**

1. Default debug

- There is a debug already set up in this project. you can see its config at **.vscode/launch.json**
- You can run debug locally by click on **Run and Debug** icon on left SideBar tab of VSCode, and click **Play** icon in the top.

<br/><br/>

## **Deployment 🚀**

1. Deploy to AWS CloudFormation

```
serverless deploy
```

or

```
serverless deploy --aws-profile <<your-aws-profile-name>> --stage <<alpha/beta/edu>>
```

<br/>
