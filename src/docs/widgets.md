---
title: Widgets
---

# Widgets

widget 是在 Theia 工作台面板上显示内容的部分，可能是一个视图或一个编辑器。Theia 中现有的 widget 例子是文件资源管理器、代码编辑器以及报错面板。通过扩展自定义的 widget，你可以在 Theia 应用中嵌入自定义 UI。你的自定义 UI 在窗口布局方面的行为与其他 widget 相同，包括标题标签、调整大小、拖动以及打开/关闭动作（见下面的截图）。


<img src="/widget-example.gif" alt="Widget Example" style="max-width: 525px">

此外，widget 能从周边工作台上接收事件，例如，在应用启动时、在调整大小时或在销毁时。不过，一个 widget 的实际的内容展示信息，完全由自己定义。作为一个例子，你可以在一个 widget 中使用 React 实现一些自定义的 UI。

简而言之，widget 是一个框架能力，用于将一些自定义（基于HTML的）UI 嵌入 Theia 工作台（见下图）。

<img src="/widget-architecture.png" alt="Widget Architecture" style="max-width: 525px">

本文档将介绍如何为 Theia 工作台扩展一个自定义的 Widget。我们将专注实现一个简单的视图组件（而非复杂的代码编辑器），并使用 React 来实现界面 UI。

如果你还不熟悉 Theia 的贡献点或依赖注入的使用机制，请参考 [Services and Contributions](https://theia-ide.org/docs/services_and_contributions/) 指南。

如果想看示例代码，请使用 [Theia extension generator](https://github.com/eclipse-theia/generator-theia-extension)。安装并选择 “Widget” 示例，输入 “MyWidget” 作为扩展名称。

## 实现一个 Widget（视图）。

在例子中，要实现一个 Widget 需要由三个部分组成：

<ul>
<li>一段完整的<b>widget</b>代码实现，包含：
    <ul>
    <li>基本参数，如 ID、label 和 icon图标</li>
    <li>具体的 UI 实现和它的操作行为</li>
    <li>处理生命周期事件，如 "onUpdateRequest" 或 "onResize"</li>
    </ul>
</li>
<li>一个<b> Widget 类</b>用于产出 widget 实例</li>
<li>一个<b> Widget 贡献点</b> 用于将视图与 Theia 工作台连接起来，以便可以从 Theia 工作台中打开 widget，比如通过视图菜单打开。</li>
</ul>

### 实现一个 Widget

为实现自定义 widgets，Theia 提供了几个基类来继承。这些基类已经实现了 widgets 所需的大部分功能，从而让开发者专注于创建自定义 UI。Theia 不依赖于特定的 UI 技术实现，用 React、Vue.js 或 Angular 都可实现。它们通过各自的基类来提供便捷的支持，如 React 模块。为避免纠结，使用 React 是目前实现自定义 widgets 的首选。下面是类的结构关系图。如果你想用 React 实现一个 widget，选择 `ReactWidget` 作为基类。如果你想实现一个树结构的 widget，请使用 `TreeWidget`。如果你不想使用 React，可以用 `BaseWidget`。查看 `BaseWidget` 的类结构关系，了解更多可用选项。

<ul>
<li>BaseWidget
    <ul>
    <li><b>ReactWidget</b>
        <ul>
        <li>TreeWidget</li>
        <li>…</li>
        </ul>
    </li>
    </ul>
</li>
</ul>

在代码案例中，我们用 `ReactWidget` 作为基类。如下图所示，先用一些基本参数来初始化 widget：


* `id`: 用于 widget 的唯一标识，比如用 WidgetManager 打开 widget 时用到。
* `label`: 用于 widget 打开时的标签显示。
* `caption`: 用于 widget 打开时，在标签上的悬停显示。
* `closable`: 配置用户是否可以关闭 widget（通过标签中的 "x" 或右键菜单）。
* `iconClass`: 用于 widget 打开时，在标签上的图标展示。

**mywidget-widget.ts**
```typescript
@injectable()
export class MyWidget extends ReactWidget {

static readonly ID = 'my:widget';
static readonly LABEL = 'My Widget';

@postConstruct()
protected async init(): Promise < void> {
    this.id = MyWidget.ID;
    this.title.label = MyWidget.LABEL;
    this.title.caption = MyWidget.LABEL;
    this.title.closable = true;
    this.title.iconClass = 'fa fa-window-maximize'; // example widget icon.
    this.update();
}
```

基类能让我们只专注于 widget 的自定义 UI 部分，做到了真正意义上的最小成本。在例子中，我们只实现了渲染函数，该函数将创建 UI 界面（使用JSX/React）。这个例子的 UI 包含一个按钮，用于触发 `displayMessage` 函数。

**mywidget-widget.ts**
```typescript
protected render(): React.ReactNode {
    const header = `This is a sample widget which simply calls the messageService in order to display an info message to end users.`;
    return <div id='widget-container'>
              <AlertMessage type='INFO' header={header} />
              <button className='theia-button secondary' title='Display Message' onClick={_a => this.displayMessage()}>Display Message</button>
           </div>
}

@inject(MessageService)
protected readonly messageService!: MessageService;
  
protected displayMessage(): void {
    this.messageService.info('Congratulations: My Widget Successfully Created!');
}
```

请注意，你也可以覆盖 `BaseWidget` 或 `ReactWidget` 来创建一个特定的 widget 生命周期钩子函数，如 `onUpdateRequest` 或 `onResize`。这些事件是由底层窗口管理框架 [Phosphor.js](https://phosphorjs.github.io/) 定义的，关于 `Widget` 类，请看 [这篇文档](http://phosphorjs.github.io/phosphor/api/widgets/classes/widget.html)。

除了编写 widget，你还需要用 Theia 工作台把它连接起来，这将在接下来的两节中介绍。

### 实现一个 Widget 工厂

Widgets in Theia are instantiated and managed by a central service, the `WidgetManager`. This allows the application to keep track of all created widgets. As an example, the `WidgetManager` supports the function `getOrCreate`, which will either return an existing widget, if it was already created, or create a new one if not.

To make a custom widget instantiatable by the widget manager, you need to register a `WidgetFactory`. A widget factory consists of an ID and a function that creates the actual widget. The widget manager will collect all contributed widget factories and pick the correct one for a respective widget by ID.

In our example (see code below), we first bind our widget `MyWidget` to itself so that we can instantiate it in our factory using dependency injection. This is not necessarily required for all widgets if they do not use dependency injection inside. We are using dependency injection in our example above to retrieve the message service and for the @postConstruct event. Second, we bind a `WidgetFactory` defining the ID of the widget and the `createWidget` function. This function allows you to control the widget creation, e.g. to pass specific parameters to a custom widget if required. In our simple example, we just use the dependency injection context to instantiate our widget.

**mywidget-frontend-module.ts**
```typescript
bind(MyWidget).toSelf();
bind(WidgetFactory).toDynamicValue(ctx => ({
    id: MyWidget.ID,
    createWidget: () => ctx.container.get<MyWidget>(MyWidget)
})).inSingletonScope();
```

Now you could already open a widget manually via using the widget manager API. However, for most use cases, you want to add a view to the view menu and also provide a respective command. This can be conveniently done using a widget contribution as described in the next section.

### Widget Contribution

Widget contributions allow you to wire a widget into the Theia workbench, more precisely to add them to the view menu and the quick command bar. Theia provides a convenient base class `AbstractViewContribution` to inherit from, which already implements the most common feature set (see example code below). For the initialization, you only need to specify the following parameters:

* `widgetID`: The ID of the widget, used to open it via the widget manager
* `widgetName`: The name which is displayed in the view menu. Usually the same name as used for the widget tab.
* `defaultWidgetOptions`: Option to influence where the widget will be displayed on opening, e.g. in the left area of the workbench. See [the typedoc](https://eclipse-theia.github.io/theia/docs/next/interfaces/core.applicationshell-2.widgetoptions.html) for more information.
* `toggleCommandId`: The command that opens the view. You can use the pre implemented `openView` function provided by the super class.
Besides specifying these base parameters, you need to register the command to open the view. The base class implements the respective command contribution interface, so you just need to implement `registerCommands` to do so (see below).

**mywidget-contribution.ts**
```typescript
export const MyWidgetCommand: Command = { id: 'widget:command' };
export class MyWidgetContribution extends AbstractViewContribution<MyWidget> {
   constructor() {
       super({
           widgetId: MyWidget.ID,
           widgetName: MyWidget.LABEL,
           defaultWidgetOptions: { area: 'left' },
           toggleCommandId: MyWidgetCommand.id
       });
   }

   registerCommands(commands: CommandRegistry): void {
       commands.registerCommand(WidgetCommand, {
           execute: () => super.openView({ activate: false, reveal: true })
       });
   }
}
```

With the contribution above, the view will now be shown in the standard “view” menu of Theia and you can also use the respective “open view” command to open it.
