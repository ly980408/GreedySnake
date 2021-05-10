// 面向对象编程
// es6+语法

// 实例
let game = null,
    snake = null,
    food = null

// 
let nodeId = 1

// configs
const GAME_CONFIG = {
  cols: 30, // 列数
  rows: 30, // 行数
  nodeW: 20, // 节点宽度
  nodeH: 20, // 节点高度
  speed: 300, // 移动速度（每次移动时间间隔 ms）
}

// dom
const GAME_CONTAINER = document.getElementById('game-container')
const GAME_START_BUTTON = document.getElementById('start-btn')
const GAME_PAUSE_BUTTON = document.getElementById('pause-btn')

/**
 * @description 节点
 * @param {Number} x 节点水平位置系数 left = x * nodeW
 * @param {Number} y 节点垂直位置系数 top = x * nodeH
 * @param {String} type 节点类型 head/body/food
 */
class Node {
  constructor(x, y, type) {
    this.id = nodeId++

    this.x = x
    this.y = y
    this.type = type
    this.el = null // 对应的 DOM 元素
    this.next = null // 后一个节点
    this.prev = null // 前一个节点
  }
  create() {
    const left = this.x * GAME_CONFIG.nodeW
    const top = this.y * GAME_CONFIG.nodeH

    const el = document.createElement('div')
    el.dataset['id'] = this.id
    el.setAttribute('class', `node node-${this.type}`)
    el.setAttribute('style', `top:${top}px;left:${left}px;`)

    this.el = el
    GAME_CONTAINER.appendChild(this.el)
  }
  remove() {
    GAME_CONTAINER.removeChild(this.el)
  }

  // 复用已存在的 Node 实例
  // 避免重复创建/删除实例及其对应的 DOM 元素
  reset(x, y, type) {
    this.x = x
    this.y = y
    const left = this.x * GAME_CONFIG.nodeW
    const top = this.y * GAME_CONFIG.nodeH
    if (type) {
      this.type = type
      el.setAttribute('class', `node node-${this.type}`)
    }
    this.el.setAttribute('style', `top:${top}px;left:${left}px;`)
  }
}

// 封装一个创建 Node 实例的方法，并返回已经创建的实例
function createNode (x, y, type) {
  const node = new Node(x, y, type)
  node.create()
  return node
}

/**
 *  Food 食物
 */
 function createFood() {
  let flag = true // while 循环条件
  let x, y
  while (flag) {
    // 随机获取食物位置
    x = Math.round(Math.random() * (GAME_CONFIG.cols - 1))
    y = Math.round(Math.random() * (GAME_CONFIG.rows - 1))
    // 如果食物在蛇身体上，则继续循环
    flag = isSnakeIncludes(x, y)
  }

  // 如果不存在 food 实例，则创建
  // 反之，复用实例，只改变对应 dom 的位置
  if (!food) {
    food = createNode(x, y, 'food')
  } else {
    food.reset(x, y)
  }
}

/**
 *  Snake 蛇
 */
class Snake {
  constructor() {
    this.head = null // 头部
    this.tail = null // 尾部

    this.nodes = [] // 组成 snake 的所有节点

    this.dir = 'right' // 方向
  }
  init() {
    const head = createNode(2, 0, 'head')
    const body = createNode(1, 0, 'body')
    const tail = createNode(0, 0, 'body')

    head.next = body
    body.prev = head
    body.next = tail
    tail.prev = body

    this.head = head
    this.tail = tail

    this.nodes.push(head, body, tail)
  }
  move() {
    const newX = this.head.x + moveEffects[this.dir].x,
          newY = this.head.y + moveEffects[this.dir].y

    // 判断下一个位置
    // 1. 碰到自己的身体
    if (isSnakeIncludes(newX, newY)) {
      return game.over('可恶，连自己都不放过！')
    }
    // 2. 碰到边界
    if (
      newX < 0 ||
      newX > GAME_CONFIG.cols - 1 ||
      newY < 0 || 
      newY > GAME_CONFIG.rows - 1
    ) {
      return game.over('猪撞树上了，你撞墙上了～')
    }
    // 3. 吃到食物

    // move
    console.log('move')
    // 把当前头部所在位置变为身体

    // 新生成一个头部
    const newHead = createNode(newX, newY, 'head')
    this.head = newHead
  }
  changeDir(dir) {
    if (dir === dirAgainst[this.dir]) {
      return false
    }
    this.dir = dir
  }
}

// dir 
const dirAgainst = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
}
// 移动产生的影响
const moveEffects = {
  up: {
    x: 0,
    y: -1,
  },
  down: {
    x: 0,
    y: 1,
  },
  left: {
    x: -1,
    y: 0,
  },
  right: {
    x: 1,
    y: 0,
  }
}

// 判断位置坐标是否在蛇身上
function isSnakeIncludes(x, y) {
  return snake && snake.nodes.some(n => (n.x === x && n.y === y))
}

/**
 *  Game 游戏相关
 */
class Game {
  constructor() {
    this.timer = null // 计时器
    this.score = 0 // 得分

    this.isGameOver = false
  }
  init() {
    // 生成蛇 和 食物
    snake = new Snake()
    snake.init()
    createFood()

    // 监听键盘事件
    document.addEventListener('keydown', ev => {
      switch (ev.code) {
        case 'KeyW':
        case 'ArrowUp':
          snake.changeDir('up')
          break
        case 'KeyS':
        case 'ArrowDown':
          snake.changeDir('down')
          break
        case 'KeyA':
        case 'ArrowLeft':
          snake.changeDir('left')
          break
        case 'KeyD':
        case 'ArrowRight':
          snake.changeDir('right')
          break;
        case 'Space':
          const started = !!game.timer
          if (started) {
            game.pause()
          } else {
            game.start()
          }
          break
        default:
          break
      }
    })

    // 按钮事件绑定
    GAME_START_BUTTON.onclick = function() {
      game.start()
    }
    
    GAME_PAUSE_BUTTON.onclick = function() {
      game.pause()
    }
  }
  start() {
    if (this.timer) {
      return
    }
    // 定时器 让蛇动起来
    this.timer = setInterval(() => {
      snake.move()
    }, GAME_CONFIG.speed);

    GAME_START_BUTTON.disabled = true
  }
  pause() {
    clearInterval(this.timer)
    this.timer = null
    GAME_START_BUTTON.disabled = false
  }
  reset() {
    this.score = 0
    this.timer = null
    this.isGameOver = false
    GAME_CONTAINER.innerHTML = ''

    nodeId = 1

    snake = null
    food = null

    snake = new Snake()
    snake.init()

    createFood()

    GAME_START_BUTTON.disabled = false
  }
  over(msg) {
    this.isGameOver = true
    clearInterval(this.timer)
    this.timer = null
    console.log('game over')
    alert(msg)
    this.reset()
  }
}

// run
game = new Game()
game.init()
