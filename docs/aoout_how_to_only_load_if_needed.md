分三步：

1. 数据方面 - 使用[runtimeObject(函数必须是幂等的)]，只有用到时， 才会去计算
2. 数据方便 - 使用[batch]， 批处理， 各种[`<Visable>`]单任务(需要查看solidjs的batch是怎么实现的？)
3. UI方面 - 关键信息使用[`<visible>`]，表示只有看到了， 才去计算，同时，也会处理“失活”
