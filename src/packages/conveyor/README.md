## 对按需获取并更新，并订阅的思考

[notion](https://edsolaters.notion.site/8ec939cc277f4c28bb9eb452f07c52e6?pvs=4)

- 需要有个获取的函数，做到获取时订阅这个变量的更新。如果变量更新了，得重新运行“获取”操作所在的函数

- 对不可视的，这个更新就没必要了。“没必要了”，即，execute副作用函数自销毁了。
  - 销毁，即函数是个对象属性，销毁即`delete obj[property]`
  - 判定是否存续，用 element 的 `getFromStore`
    - visiable chain 本身就是自动订阅的，订阅使用到的变量
    - 变量的属性有这个变量使用到的其他变量，获取其他变量这个操作本身就能知道它的依赖项有哪些。
