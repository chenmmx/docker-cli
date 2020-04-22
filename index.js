const program = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");
const ora = require("ora");
const shell = require("shelljs");
const node_ssh = require("node-ssh");
const ssh = new node_ssh();

const questions = [
  {
    type: "input",
    name: "projectPath",
    message: "请输入需要构建的项目文件路径",
    filter: (v) => {
      return v;
    },
  },
  {
    type: "input",
    name: "imageName",
    message: "请输入镜像名",
    filter: (v) => {
      return v;
    },
  },
];

const questions1 = [
  {
    type: "input",
    name: "containerName",
    message: "请输入要删除的容器名",
    filter: (v) => {
      return v;
    },
  },
];

const runCommand = async (command) => {
  const result = await ssh.exec(command, []);
};

program
  .command("build")
  .description("docker build项目")
  .action(() => {
    inquirer.prompt(questions).then((answers) => {
      console.log("打包镜像中，请稍后...");
      const { projectPath, imageName } = answers;
      shell.cd(projectPath);
      shell.exec(`docker build -t ${imageName} .`);
      shell.exec(`docker push ${imageName}`);
      shell.exec(`docker rmi $(docker images -f "dangling=true" -q)`);
      console.log("正在通过ssh连接服务器...");
      ssh
        .connect({
          host: "xxx.xxx.xxx.xxx",
          username: "xxx",
          password: "xxxxxx",
        })
        .then(async () => {
          console.log("连接成功");
          inquirer.prompt(questions1).then(async (answers) => {
            const { containerName } = answers;
            await runCommand(`docker pull ${imageName}`);
            await runCommand(`docker stop ${containerName}`);
            await runCommand(`docker rm ${containerName}`);
            await runCommand(
              `docker run -d --network=host --name ${containerName} ${imageName}`
            );
            await runCommand("exit");
            console.log("打工是不可能打工的，这辈子都不可能打工的！");
            process.exit(0);
          });
        });
    });
  });

program.parse(process.argv);
