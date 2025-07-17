#!/usr/bin/env node

/**
 * 前端工程化脚本聚合工具
 * 提供交互式命令行界面，统一管理所有工程化脚本
 * 适配 inquirer@12.7.0
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { select, input, confirm } = require("@inquirer/prompts");

const colors = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  gray: "\x1B[90m",
};

const log = {
  info: msg => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`),
  success: msg => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: msg => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: msg => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  title: msg => console.log(`${colors.bright}${colors.magenta}🚀 ${msg}${colors.reset}`),
  step: msg => console.log(`${colors.blue}📝 ${msg}${colors.reset}`),
  gray: msg => console.log(`${colors.gray}${msg}${colors.reset}`),
};

class EngineeeringCLI {
  constructor() {
    this.projectRoot = path.resolve(__dirname, "..");

    this.menuConfig = {
      main: {
        title: "🛠️  前端工程化工具",
        options: [
          { key: "1", label: "环境管理", action: "environment" },
          { key: "2", label: "依赖管理", action: "dependencies" },
          { key: "3", label: "代码质量", action: "quality" },
          { key: "4", label: "构建管理", action: "build" },
          { key: "5", label: "开发服务", action: "development" },
          { key: "6", label: "Git 工作流", action: "git" },
          { key: "7", label: "性能分析", action: "performance" },
          { key: "8", label: "快速操作", action: "quick" },
          { key: "0", label: "退出", action: "exit" },
        ],
      },
      environment: {
        title: "🔧 环境管理",
        options: [
          { key: "1", label: "检查开发环境", script: "check-env.js", args: [] },
          { key: "2", label: "系统信息", script: "dev.js", args: ["info"] },
          { key: "3", label: "健康检查", script: "dev.js", args: ["health"] },
          { key: "0", label: "返回主菜单", action: "main" },
        ],
      },
      dependencies: {
        title: "📦 依赖管理",
        options: [
          { key: "1", label: "检查所有依赖问题", script: "deps-check.js", args: [] },
          { key: "2", label: "检查过时的依赖", script: "deps-check.js", args: ["outdated"] },
          { key: "3", label: "安全漏洞扫描", script: "deps-check.js", args: ["security"] },
          { key: "4", label: "检查重复依赖", script: "deps-check.js", args: ["duplicates"] },
          { key: "5", label: "清理并重新安装", script: "deps-check.js", args: ["cleanup"] },
          { key: "0", label: "返回主菜单", action: "main" },
        ],
      },
      quality: {
        title: "🔍 代码质量",
        options: [
          { key: "1", label: "完整质量检查", script: "quality.js", args: [] },
          { key: "2", label: "ESLint 检查", script: "quality.js", args: ["lint"] },
          { key: "3", label: "自动修复代码格式", script: "quality.js", args: ["lint", "--fix"] },
          { key: "4", label: "TypeScript 类型检查", script: "quality.js", args: ["typecheck"] },
          { key: "5", label: "代码复杂度分析", script: "quality.js", args: ["complexity"] },
          { key: "6", label: "运行测试", script: "quality.js", args: ["test"] },
          { key: "0", label: "返回主菜单", action: "main" },
        ],
      },
      build: {
        title: "🏗️  构建管理",
        options: [
          { key: "1", label: "清理构建产物", script: "build.js", args: ["clean"] },
          { key: "2", label: "构建生产版本", script: "build.js", args: ["build", "production"] },
          { key: "3", label: "构建开发版本", script: "build.js", args: ["build", "development"] },
          { key: "4", label: "构建桌面应用", script: "build.js", args: ["desktop"] },
          { key: "5", label: "预览构建结果", script: "build.js", args: ["preview"] },
          { key: "6", label: "分析构建产物", script: "build.js", args: ["analyze"] },
          { key: "0", label: "返回主菜单", action: "main" },
        ],
      },
      development: {
        title: "🚀 开发服务",
        options: [
          { key: "1", label: "启动 Nuxt 开发服务器", script: "dev.js", args: ["nuxt", "development"] },
          { key: "2", label: "启动 Nuxt 生产模式", script: "dev.js", args: ["nuxt", "production"] },
          { key: "3", label: "启动 Tauri 开发", script: "dev.js", args: ["tauri"] },
          { key: "4", label: "启动 Android 开发", script: "dev.js", args: ["mobile", "android"] },
          { key: "5", label: "启动 iOS 开发", script: "dev.js", args: ["mobile", "ios"] },
          { key: "6", label: "停止所有服务", script: "dev.js", args: ["stop"] },
          { key: "0", label: "返回主菜单", action: "main" },
        ],
      },
      git: {
        title: "📝 Git 工作流",
        options: [
          { key: "1", label: "检查 Git 状态", script: "git.js", args: ["status"] },
          { key: "2", label: "预提交检查", script: "git.js", args: ["pre-commit"] },
          { key: "3", label: "生成变更日志", script: "git.js", args: ["changelog"] },
          { key: "4", label: "版本发布 (patch)", script: "git.js", args: ["release", "patch"] },
          { key: "5", label: "版本发布 (minor)", script: "git.js", args: ["release", "minor"] },
          { key: "6", label: "版本发布 (major)", script: "git.js", args: ["release", "major"] },
          { key: "7", label: "设置 Git Hooks", script: "git.js", args: ["setup-hooks"] },
          { key: "0", label: "返回主菜单", action: "main" },
        ],
      },
      performance: {
        title: "⚡ 性能分析",
        options: [
          { key: "1", label: "分析构建产物大小", script: "performance.js", args: ["bundle"] },
          { key: "2", label: "Lighthouse 性能分析", script: "performance.js", args: ["lighthouse"] },
          { key: "3", label: "内存使用监控", script: "performance.js", args: ["memory"] },
          { key: "4", label: "网络性能测试", script: "performance.js", args: ["network"] },
          { key: "5", label: "生成完整性能报告", script: "performance.js", args: ["report"] },
          { key: "0", label: "返回主菜单", action: "main" },
        ],
      },
      quick: {
        title: "⚡ 快速操作",
        options: [
          { key: "1", label: "快速检查 (环境+依赖+质量)", action: "quickCheck" },
          { key: "2", label: "快速构建 (清理+构建+分析)", action: "quickBuild" },
          { key: "3", label: "快速发布 (检查+构建+发布)", action: "quickRelease" },
          { key: "4", label: "开发环境启动", action: "quickDev" },
          { key: "0", label: "返回主菜单", action: "main" },
        ],
      },
    };
  }

  /**
   * 显示欢迎信息
   */
  showWelcome() {
    console.clear();
    console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                    🛠️  前端工程化工具 v1.0                    ║
║                                                               ║
║  📦 依赖管理  🔍 代码质量  🏗️  构建管理  🚀 开发服务          ║
║  📝 Git工作流  ⚡ 性能分析  🔧 环境管理  ⚡ 快速操作          ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

    const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, "package.json"), "utf8"));
    log.gray(`项目: ${packageJson.name} v${packageJson.version}`);
    log.gray(`Node.js: ${process.version} | 平台: ${process.platform}
`);
  }

  /**
   * 显示菜单并获取选择（使用新的 Inquirer.js API）
   */
  async showMenuAndGetChoice(menuName) {
    const menu = this.menuConfig[menuName];
    if (!menu) {
      log.error(`菜单 "${menuName}" 不存在`);
      return null;
    }

    const choices = [];
    const functionOptions = menu.options.filter(opt => opt.key !== "0");

    // 添加功能选项
    functionOptions.forEach((option) => {
      const icon = this.getOptionIcon(option, menuName);
      choices.push({
        name: `${icon} ${option.label}`,
        value: option,
        description: option.description || `执行${option.label}`,
      });
    });

    // 返回/退出项始终置底
    const exitOption = menu.options.find(opt => opt.key === "0");
    if (exitOption) {
      const exitIcon = menuName === "main" ? "🚪" : "🔙";
      choices.push({
        name: `${exitIcon} ${exitOption.label}`,
        value: exitOption,
        description: exitOption.label,
      });
    }

    // 菜单标题美化
    console.log("\n");
    log.title(menu.title);
    console.log("");

    try {
      const selection = await select({
        message: `${colors.bright}${colors.cyan}请选择操作:${colors.reset}`,
        choices,
        pageSize: 12,
        loop: false,
      });

      return selection;
    }
    catch (error) {
      if (error.name === "ExitPromptError") {
        log.info("用户取消了操作");
        return null;
      }
      log.error(`用户输入错误: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取选项图标
   */
  getOptionIcon(option, menuName) {
    const iconMap = {
      environment: {
        检查开发环境: "🔍",
        系统信息: "ℹ️",
        健康检查: "🏥",
      },
      dependencies: {
        检查所有依赖问题: "🔍",
        检查过时的依赖: "📅",
        安全漏洞扫描: "🛡️",
        检查重复依赖: "🔄",
        清理并重新安装: "🧹",
      },
      quality: {
        "完整质量检查": "🔍",
        "ESLint 检查": "📋",
        "自动修复代码格式": "🔧",
        "TypeScript 类型检查": "📝",
        "代码复杂度分析": "📊",
        "运行测试": "🧪",
      },
      build: {
        清理构建产物: "🧹",
        构建生产版本: "🏭",
        构建开发版本: "🔨",
        构建桌面应用: "💻",
        预览构建结果: "👁️",
        分析构建产物: "📊",
      },
      development: {
        "启动 Nuxt 开发服务器": "🌐",
        "启动 Nuxt 生产模式": "🚀",
        "启动 Tauri 开发": "💻",
        "启动 Android 开发": "📱",
        "启动 iOS 开发": "🍎",
        "停止所有服务": "⏹️",
      },
      git: {
        "检查 Git 状态": "📊",
        "预提交检查": "✅",
        "生成变更日志": "📝",
        "版本发布 (patch)": "🔄",
        "版本发布 (minor)": "📈",
        "版本发布 (major)": "🚀",
        "设置 Git Hooks": "🪝",
      },
      performance: {
        "分析构建产物大小": "📦",
        "Lighthouse 性能分析": "⚡",
        "内存使用监控": "🧠",
        "网络性能测试": "🌐",
        "生成完整性能报告": "📊",
      },
      quick: {
        "快速检查 (环境+依赖+质量)": "⚡",
        "快速构建 (清理+构建+分析)": "🏗️",
        "快速发布 (检查+构建+发布)": "🚀",
        "开发环境启动": "💻",
      },
      main: {
        "环境管理": "🔧",
        "依赖管理": "📦",
        "代码质量": "🔍",
        "构建管理": "🏗️",
        "开发服务": "🚀",
        "Git 工作流": "📝",
        "性能分析": "⚡",
        "快速操作": "⚡",
      },
    };

    return iconMap[menuName]?.[option.label] || "🔹";
  }

  /**
   * 获取用户输入（使用新的 Inquirer.js API）
   */
  async getUserInput(prompt = "请选择操作", type = "input", choices = []) {
    try {
      let result;

      switch (type) {
        case "input":
          result = await input({
            message: prompt,
            default: "",
          });
          return result.trim();

        case "confirm":
          result = await confirm({
            message: prompt,
            default: false,
          });
          return result;

        case "list":
          if (choices.length > 0) {
            result = await select({
              message: prompt,
              choices: choices.map(choice => ({
                name: choice,
                value: choice,
              })),
              pageSize: Math.min(choices.length + 2, 10),
              loop: false,
            });
            return result;
          }
          break;

        default:
          result = await input({
            message: prompt,
            default: "",
          });
          return result.trim();
      }
    }
    catch (error) {
      if (error.name === "ExitPromptError") {
        log.info("用户取消了操作");
        return null;
      }
      log.error(`用户输入错误: ${error.message}`);
      return null;
    }
  }

  /**
   * 显示进度提示
   */
  showProgress(message, isComplete = false) {
    const spinner = isComplete ? "✅" : "⏳";
    console.log(`${colors.blue}${spinner} ${message}${colors.reset}`);
  }

  /**
   * 显示执行结果
   */
  showResult(success, message) {
    if (success) {
      log.success(message);
    }
    else {
      log.error(message);
    }
  }

  /**
   * 执行脚本
   */
  async executeScript(scriptName, args = []) {
    const scriptPath = path.join(this.projectRoot, "scripts", scriptName);

    if (!fs.existsSync(scriptPath)) {
      log.error(`脚本 ${scriptName} 不存在`);
      return false;
    }

    try {
      log.step(`执行: ${scriptName} ${args.join(" ")}`);
      const command = `node "${scriptPath}" ${args.join(" ")}`;

      execSync(command, {
        cwd: this.projectRoot,
        stdio: "inherit",
      });

      log.success("执行完成!\n");
      return true;
    }
    catch (error) {
      log.error(`执行失败: ${error.message}\n`);
      return false;
    }
  }

  /**
   * 快速检查
   */
  async quickCheck() {
    log.title("🚀 执行快速检查...");

    const tasks = [
      { name: "环境检查", script: "check-env.js", args: [] },
      { name: "依赖检查", script: "deps-check.js", args: [] },
      { name: "代码质量检查", script: "quality.js", args: [] },
    ];

    for (const task of tasks) {
      log.step(`正在进行 ${task.name}...`);
      const success = await this.executeScript(task.script, task.args);
      if (!success) {
        log.error(`${task.name} 失败，终止快速检查`);
        return;
      }
    }

    log.success("🎉 快速检查全部完成!");
  }

  /**
   * 快速构建
   */
  async quickBuild() {
    log.title("🚀 执行快速构建...");

    const tasks = [
      { name: "清理构建产物", script: "build.js", args: ["clean"] },
      { name: "构建项目", script: "build.js", args: ["build", "production"] },
      { name: "分析构建产物", script: "performance.js", args: ["bundle"] },
    ];

    for (const task of tasks) {
      log.step(`正在进行 ${task.name}...`);
      const success = await this.executeScript(task.script, task.args);
      if (!success) {
        log.error(`${task.name} 失败，终止快速构建`);
        return;
      }
    }

    log.success("🎉 快速构建全部完成!");
  }

  /**
   * 快速发布（使用新的 Inquirer.js API）
   */
  async quickRelease() {
    log.title("🚀 执行快速发布...");

    try {
      const releaseType = await select({
        message: "请选择发布类型",
        choices: [
          { name: "🔄 Patch (修复版本)", value: "patch" },
          { name: "📈 Minor (功能版本)", value: "minor" },
          { name: "🚀 Major (主版本)", value: "major" },
        ],
        default: "patch",
      });

      const tasks = [
        { name: "预提交检查", script: "git.js", args: ["pre-commit"] },
        { name: "构建项目", script: "build.js", args: ["build", "production"] },
        { name: "版本发布", script: "git.js", args: ["release", releaseType] },
      ];

      for (const task of tasks) {
        log.step(`正在进行 ${task.name}...`);
        const success = await this.executeScript(task.script, task.args);
        if (!success) {
          log.error(`${task.name} 失败，终止快速发布`);
          return;
        }
      }

      log.success("🎉 快速发布全部完成!");
    }
    catch (error) {
      if (error.isTtyError) {
        log.error("当前环境不支持交互式提示");
      }
      else {
        log.error(`快速发布失败: ${error.message}`);
      }
    }
  }

  /**
   * 快速开发启动（使用新的 Inquirer.js API）
   */
  async quickDev() {
    log.title("🚀 启动开发环境...");

    try {
      const platform = await select({
        message: "请选择平台",
        choices: [
          { name: "🌐 Nuxt (Web开发)", value: "nuxt" },
          { name: "💻 Tauri (桌面应用)", value: "tauri" },
          { name: "📱 Android (安卓应用)", value: "android" },
          { name: "🍎 iOS (苹果应用)", value: "ios" },
        ],
        default: "nuxt",
      });

      const platformMap = {
        nuxt: ["nuxt", "development"],
        tauri: ["tauri"],
        android: ["mobile", "android"],
        ios: ["mobile", "ios"],
      };

      if (!platformMap[platform]) {
        log.error("无效的平台选择");
        return;
      }

      await this.executeScript("dev.js", platformMap[platform]);
    }
    catch (error) {
      if (error.isTtyError) {
        log.error("当前环境不支持交互式提示");
      }
      else {
        log.error(`快速开发启动失败: ${error.message}`);
      }
    }
  }

  /**
   * 主循环（适配 inquirer@12.7.0）
   */
  async run() {
    try {
      this.showWelcome();

      let currentMenu = "main";

      while (currentMenu !== "exit") {
        console.clear();
        this.showWelcome();

        const option = await this.showMenuAndGetChoice(currentMenu);

        if (!option) {
          // 用户取消或出错，返回主菜单
          currentMenu = "main";
          continue;
        }

        let nextMenu = currentMenu;
        let shouldPause = false;

        if (option.action) {
          switch (option.action) {
            case "exit":
              currentMenu = "exit";
              break;
            case "quickCheck":
              await this.quickCheck();
              shouldPause = true;
              break;
            case "quickBuild":
              await this.quickBuild();
              shouldPause = true;
              break;
            case "quickRelease":
              await this.quickRelease();
              shouldPause = true;
              break;
            case "quickDev":
              await this.quickDev();
              shouldPause = true;
              break;
            default:
              nextMenu = option.action;
          }
        }
        else if (option.script) {
          await this.executeScript(option.script, option.args);
          shouldPause = true;
        }

        if (currentMenu !== "exit") {
          if (shouldPause) {
            const continueInput = await this.getUserInput("按 Enter 继续...", "input");
            if (continueInput === null) {
              // 用户取消，返回主菜单
              currentMenu = "main";
            }
          }
          currentMenu = nextMenu;
        }
      }

      log.success("感谢使用前端工程化工具! 👋");
    }
    catch (error) {
      log.error(`程序运行出错: ${error.message}`);
      process.exit(1);
    }
  }
}

// 主函数
async function main() {
  const cli = new EngineeeringCLI();
  await cli.run();
}

// 检查是否直接运行
if (require.main === module) {
  main().catch((error) => {
    console.error(`工具运行失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = EngineeeringCLI;
