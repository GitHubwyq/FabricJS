<template>
  <div class="wraper" ref="wraper">
    <div class="download">
      <button type="button" :disabled="done" @click="downLoadImage">
        转换为base64并预览
      </button>
      <img :src="imageBase64" v-show="imageBase64 != ''" alt="" />
    </div>
    <div class="content_area">
      <div class="controlPanel" style="border-top:1px solid #dad7d9">
        <el-tooltip class="item" effect="dark" content="取色器" placement="right">
          <div class="contro-item palette">
            <el-popover
              v-model="paletteShow"
              placement="right"
              width="200"
              trigger="click"
            >
              <div style="display: flex; align-items: center">
                <span style="margin-right: 5px">颜色：{{ drawPenColor }}</span>
                <el-color-picker
                  v-model="paletteColor"
                  @change="changeColor"
                  :predefine="predefineColors"
                >
                </el-color-picker>
              </div>
              <i slot="reference" class="iconfont el-icon-yanse"></i>
            </el-popover>
          </div>
        </el-tooltip>

        <div
          :class="[initIdx == idx ? 'contro-item active' : 'contro-item']"
          v-for="(item, idx) in toolsArr"
          :key="idx"
          @click="handleTools(item, idx)"
        >
          <el-tooltip
            class="item"
            effect="dark"
            :content="item.desc"
            placement="right"
          >
            <i class="iconfont" :class="'el-icon-' + item.icon"></i>
          </el-tooltip>
        </div>
      </div>
      <div class="canvas-wraper">
        <canvas id="canvas" ref="canvas"></canvas>
      </div>
    </div>
    
  </div>
</template>
<script>
export default {
  data() {
    return {
      paletteShow: false,
      paletteColor: "#E34F51",
      predefineColors: [
        "#ff4500",
        "#ff8c00",
        "#ffd700",
        "#90ee90",
        "#00ced1",
        "#1e90ff",
        "#c71585",
        "rgba(255, 69, 0, 0.68)",
        "rgb(255, 120, 0)",
        "hsv(51, 100, 98)",
        "hsva(120, 40, 94, 0.5)",
        "hsl(181, 100%, 37%)",
        "hsla(209, 100%, 56%, 0.73)",
        "#c7158577",
      ],
      done: false,
      fabricObj: null,
      currentTool: "line",
      initIdx: 1,
      toolsArr: [
        {
          name: "kuangxuan",
          icon: "kuangxuan",
          desc: "选中元素",
        },
        // {
        //   name: "pencil",
        //   icon: "pencil",
        //   desc: "自由绘制",
        // },
        {
          name: "line",
          icon: "line",
          desc: "绘制直线",
        },
        {
          name: "arrow",
          icon: "jiang-copy-copy",
          desc: "绘制箭头",
        },
        // {
        //   name: "dashedline",
        //   icon: "-xuxian",
        //   desc: "绘制虚线",
        // },
        {
          name: "text",
          icon: "text",
          desc: "添加文字",
        },
        {
          name: "rectangle",
          icon: "a-zhengfangxingfuxuankuang",
          desc: "绘制正方形",
        },
        {
          name: "circle",
          icon: "yuanxing",
          desc: "绘制圆形",
        },
        {
          name: "ellipse",
          icon: "tuoyuanxing",
          desc: "绘制椭圆",
        },
        {
          name: "equilateral", //三角形
          icon: "xingzhuang-sanjiaoxing",
          desc: "绘制三角形",
        },
        {
          name: "rightTriangle", //直角角形
          icon: "zhijiaosanjiaoxing",
          desc: "绘制直角三角形",
        },
        {
          name: "remove",
          icon: "kt_xiangpicha",
          desc: "删除所选元素",
        },
        // {
        //   name: "undo",
        //   icon: "xianghouyibu",
        //   desc: "后退",

        // },
        // {
        //   name: "redo",
        //   icon: "xiangqianyibu",
        //   desc: "向前",
        // },
        {
          name: "reset",
          icon: "reset",
          desc: "重置画板",
        },
      ],
      mouseFrom: {},
      mouseTo: {},
      moveCount: 1,
      doDrawing: false,
      fabricHistoryJson: [],
      mods: 0,
      drawingObject: null, //绘制对象
      drawColor: "#E34F51",
      drawPenColor: "#E34F51", //画笔颜色
      drawWidth: 2,
      imageBase64: "",
      zoom: window.zoom ? window.zoom : 1,
      selectionEle: null, //选中的元素
    };
  },
  mounted() {
    //初始化canvas
    this.initCanvas();
    fabric.Canvas.prototype.orderObjects = function(compare) {
      this._objects.sort(compare);
      this.renderAll();
    }
  },
  computed: {
    canvasWidth() {
      return window.innerWidth;
    },
  },
  methods: {
    // 调色器
    changeColor(val) {
      this.drawColor = val;
      this.drawPenColor = val;
      this.paletteShow = false;
      this.$nextTick(() => {
        this.fabricObj.freeDrawingBrush.color = this.drawPenColor;
      });
    },

    initCanvas() {
      this.fabricObj = new fabric.Canvas("canvas", {
        // preserveObjectStacking: true, //是否置顶置顶选中元素默认false false 置顶 true不置顶
        isDrawingMode: false, //自由绘制
        selectable: true, //控件是否被选择，被操作
        selection: true, //移动时不出现框选样式
        devicePixelRatio: true, //Retina 高清屏 屏幕支持
        centeredScaling: true,//图形中心缩放
        centeredRotation: true,//图形中心旋转
      });
      // 设置选中样式
      fabric.Object.prototype.set({
        transparentCorners: false,
        cornerStyle: "circle",
        // cornerColor: 'blue',
        // cornerStrokeColor: 'red',
        // borderColor: 'red',
        // cornerSize: 12,
        // padding: 10,
        // borderDashArray: [3, 3]
      });
      // console.log(fabric.Object.prototype,'fabric.Object.prototype');
      this.fabricObj.freeDrawingBrush.color = this.drawPenColor;
      this.fabricObj.freeDrawingBrush.width = 2;
      this.fabricObj.setWidth(this.canvasWidth);
      this.fabricObj.setHeight(500);;
      // this.fabricObj.loadFromJSON('{"version":"4.3.1","objects":[{"type":"rect","version":"4.3.1","originX":"left","originY":"top","left":50,"top":50,"width":20,"height":20,"fill":"green","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0},{"type":"circle","version":"4.3.1","originX":"left","originY":"top","left":100,"top":100,"width":100,"height":100,"fill":"red","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"radius":50,"startAngle":0,"endAngle":6.283185307179586}],"background":"#ddd"}')
      //绑定画板事件
      this.fabricObjAddEvent();
    },
    // 解决line不能填充的问题
    renderLineFun(path, left, top, fill) {
      this.fabricObj.add(
        new fabric.Path(path, {
          left,
          top,
          fill,
        })
      );
      this.clearSelectionEle();
    },
    //时间监听
    fabricObjAddEvent() {
      this.fabricObj.on({
        "mouse:down": (o) => {
          this.mouseFrom.x = o.pointer.x;
          this.mouseFrom.y = o.pointer.y;
          this.doDrawing = true;
          if (this.currentTool == "text") {
            this.drawText();
          }
          // console.log(o,'鼠标按下');
        },
        "mouse:up": (o) => {
          this.mouseTo.x = o.pointer.x;
          this.mouseTo.y = o.pointer.y;
          this.drawingObject = null;
          this.moveCount = 1;
          this.doDrawing = false;
          this.updateModifications(true);
          // console.log(o,'鼠标松开');
        },
        "mouse:move": (o) => {
          if (this.moveCount % 2 && !this.doDrawing) {
            //减少绘制频率
            return;
          }
          this.moveCount++;
          this.mouseTo.x = o.pointer.x;
          this.mouseTo.y = o.pointer.y;
          // console.log(o,'鼠标移动');
          // 防止拉伸时继续绘制图形
          if (o.transform == null) {
            this.drawing();
          }
        },
        //对象移动时间
        "object:moving": (e) => {
          e.target.opacity = 0.5;
        },
        //增加对象
        "object:added": () => {
          // debugger
        },
        "object:modified": (e) => {
          e.target.opacity = 1;
          // let object = e.target;
          this.updateModifications(true);
        },
        "selection:cleared": (e) => {
          // console.log(e,'cleared');
        },
        "selection:updated": (e) => {
          // console.log(e,'updated');
          this.selectionEle = e;
        },
        "selection:created": (e) => {
          // console.log(e, "元素选中");
          this.selectionEle = e;
          // 针对绘制直线、虚线时无法填充的问题
          if(e.selected[0].fill === "lineId"){
            let M = "";
            let L = "";
            e.selected.map((item, index) => {
              if(index == 0){
                M = `M ${item.x1} ${item.y1}`
              }else{
                L +=  `L ${item.x1} ${item.y1}`
              }
            });
            let path = `${M} ${L}`;
            this.renderLineFun(path,e.target.left,e.target.top,this.drawPenColor)
          }
          // if (e.target._objects) {
          //   //多选删除
          //   var etCount = e.target._objects.length;
          //   for (var etindex = 0; etindex < etCount; etindex++) {
          //     this.fabricObj.remove(e.target._objects[etindex]);
          //   }
          // } else {
          //   //单选删除
          //   this.fabricObj.remove(e.target);
          // }
          // this.fabricObj.discardActiveObject(); //清楚选中框
          // this.updateModifications(true);
        },
        "object:scaling": (e) => {
          console.log(e, "scaling");
          var o = e.target;
          if (!o.strokeWidthUnscaled && o.strokeWidth) {
            o.strokeWidthUnscaled = o.strokeWidth;
          }
          if (o.strokeWidthUnscaled) {
            o.strokeWidth = o.strokeWidthUnscaled / o.scaleX;
          }
        },
      });
    },
    // 清除选中的元素
    clearSelectionEle() {
      if (this.selectionEle.target._objects) {
        //多选删除
        var etCount = this.selectionEle.target._objects.length;
        for (var etindex = 0; etindex < etCount; etindex++) {
          this.fabricObj.remove(this.selectionEle.target._objects[etindex]);
        }
      } else {
        //单选删除
        this.fabricObj.remove(this.selectionEle.target);
      }
      this.fabricObj.discardActiveObject(); //清楚选中框
      this.updateModifications(true);
    },

    //储存历史记录
    updateModifications(savehistory) {
      if (savehistory == true) {
        this.fabricHistoryJson.push(JSON.stringify(this.fabricObj));
      }
    },
    //canvas 历史后退
    undo() {
      let state = this.fabricHistoryJson;
      if (this.mods < state.length) {
        this.fabricObj.clear().renderAll();
        this.fabricObj.loadFromJSON(state[state.length - 1 - this.mods - 1]);
        this.fabricObj.renderAll();
        this.mods += 1;
      }
    },
    //前进
    redo() {
      let state = this.fabricHistoryJson;
      if (this.mods > 0) {
        this.fabricObj.clear().renderAll();
        this.fabricObj.loadFromJSON(state[state.length - 1 - this.mods + 1]);
        this.fabricObj.renderAll();
        this.mods -= 1;
      }
    },
    transformMouse(mouseX, mouseY) {
      return { x: mouseX / this.zoom, y: mouseY / this.zoom };
    },
    resetObj() {
      this.fabricObj.selectable = false;
      this.fabricObj.selection = false;
      this.fabricObj.skipTargetFind = true; //整个画板元素不能被选中
      //清除文字对象
      if (this.textboxObj) {
        this.textboxObj.exitEditing();
        this.textboxObj = null;
      }
    },
    selectionFun() {
      this.fabricObj.selection = true;
      this.fabricObj.selectionColor = "rgba(100, 100, 255, 0.3)";
      this.fabricObj.selectionBorderColor = "rgba(255, 255, 255, 0.3)";
      this.fabricObj.skipTargetFind = false; // 允许选中
    },
    handleTools(tools, idx) {
      this.initIdx = idx;
      this.currentTool = tools.name;
      this.fabricObj.isDrawingMode = false;
      this.resetObj();
      switch (tools.name) {
        case "kuangxuan":
          this.selectionFun();
          break;
        case "pencil":
          this.fabricObj.isDrawingMode = true;
          break;
        case "remove":
          this.fabricObj.selection = true;
          this.fabricObj.skipTargetFind = false;
          this.fabricObj.selectable = true;
          if (this.selectionEle != null) {
            this.clearSelectionEle();
          }
          break;
        case "reset":
          this.fabricObj.clear();
          break;
        case "redo":
          this.redo();
          break;
        case "undo":
          this.undo();
          break;
        default:
          break;
      }
    },
    //绘制文字对象
    drawText() {
      this.textboxObj = new fabric.Textbox(" ", {
        left: this.mouseFrom.x,
        top: this.mouseFrom.y,
        width: 220,
        fontSize: 18,
        fill: this.drawColor,
        hasControls: true,
      });
      this.fabricObj.add(this.textboxObj);
      this.textboxObj.enterEditing();
      this.textboxObj.hiddenTextarea.focus();
      this.updateModifications(true);
    },
    // 直线、虚线绘制时禁止自动选中
    forbidSelectionFun() {
      this.fabricObj.selectable = false;
      this.fabricObj.selection = false;
      this.fabricObj.selectionColor = "transparent";
      this.fabricObj.selectionBorderColor = "transparent";
      this.fabricObj.skipTargetFind = true; // 禁止选中
    },
    drawing() {
      if (this.drawingObject) {
        this.fabricObj.remove(this.drawingObject);
      }
      let fabricObject = null;
      switch (this.currentTool) {
        case "pencil":
          this.fabricObj.isDrawingMode = true;
          break;
        case "line":
          this.forbidSelectionFun();
          fabricObject = new fabric.Line(
            [
              this.mouseFrom.x,
              this.mouseFrom.y,
              this.mouseTo.x,
              this.mouseTo.y,
            ],
            {
              fill: 'lineId',
              stroke: this.drawColor,
              strokeWidth: this.drawWidth,
            }
          );
          break;
        case "arrow":
          fabricObject = new fabric.Path(
            this.drawArrow(
              this.mouseFrom.x,
              this.mouseFrom.y,
              this.mouseTo.x,
              this.mouseTo.y,
              15.5,
              15.5
            ),
            {
              stroke: this.drawColor,
              fill: "rgba(255,255,255,0)",
              strokeWidth: this.drawWidth,
            }
          );
          break;
        case "dashedline":
          // doshed line
          this.forbidSelectionFun();
          fabricObject = this.drawDoshedLine();
          break;
        case "rectangle":
          // 矩形
          fabricObject = this.drawRectangle();
          break;
        case "circle": //正圆
          fabricObject = this.drawCircle();
          break;
        case "ellipse":
          // 椭圆
          fabricObject = this.drawEllipse();
          break;
        case "equilateral": //等边三角形
          fabricObject = this.drawTriangle();
          break;
        case "rightTriangle": //直角三角形
          fabricObject = this.rightTriangle();
          break;
        case "remove":
          break;
        default:
          // statements_def'
          break;
      }
      if (fabricObject) {
        this.$nextTick(() => {
          this.fabricObj.add(fabricObject);
          this.drawingObject = fabricObject;
        });
      }
    },
    // dashed line
    drawDoshedLine() {
      return new fabric.Line(
        [this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y],
        {
          fill: 'lineId',
          strokeDashArray: [10, 3],
          stroke: this.drawColor,
          strokeWidth: this.drawWidth,
        }
      );
    },
    // circle
    drawCircle() {
      let radius =
        Math.sqrt(
          (this.mouseTo.x - this.mouseFrom.x) *
            (this.mouseTo.x - this.mouseFrom.x) +
            (this.mouseTo.y - this.mouseFrom.y) *
              (this.mouseTo.y - this.mouseFrom.y)
        ) / 2;
      return new fabric.Circle({
        left: this.mouseFrom.x,
        top: this.mouseFrom.y,
        stroke: this.drawColor,
        fill: this.drawColor,
        radius: radius,
        strokeWidth: this.drawWidth,
      });
    },
    // triangle
    drawTriangle() {
      let height = this.mouseTo.y - this.mouseFrom.y;
      return new fabric.Triangle({
        top: this.mouseFrom.y,
        left: this.mouseFrom.x,
        width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
        height: height,
        stroke: this.drawColor,
        strokeWidth: this.drawWidth,
        fill: this.drawColor,
      });
    },
    // 直角三角形rightTriangle
    rightTriangle() {
      let path =
        "M " +
        this.mouseFrom.x +
        " " +
        this.mouseFrom.y +
        " L " +
        this.mouseFrom.x +
        " " +
        this.mouseTo.y +
        " L " +
        this.mouseTo.x +
        " " +
        this.mouseTo.y +
        " z";
      return new fabric.Path(path, {
        top: this.mouseFrom.y,
        left: this.mouseFrom.x,
        stroke: this.drawColor,
        strokeWidth: this.drawWidth,
        fill: this.drawColor,
      });
    },
    // ellipse
    drawEllipse() {
      let left = this.mouseFrom.x;
      let top = this.mouseFrom.y;
      // let ellipse = Math.sqrt((this.mouseTo.x - left) * (this.mouseTo.x - left) + (this.mouseTo.y - top) * (this.mouseTo.y - top)) / 2;
      return new fabric.Ellipse({
        left: left,
        top: top,
        stroke: this.drawColor,
        fill: this.drawColor,
        originX: "center",
        originY: "center",
        rx: Math.abs(left - this.mouseTo.x),
        ry: Math.abs(top - this.mouseTo.y),
        strokeWidth: this.drawWidth,
      });
    },
    // rectangle
    drawRectangle() {
      return new fabric.Rect({
        left: this.mouseFrom.x,
        top: this.mouseFrom.y,
        width: this.mouseTo.x - this.mouseFrom.x,
        height: this.mouseTo.y - this.mouseFrom.y,
        fill: this.drawColor,
        stroke: this.drawColor,
        strokeWidth: this.drawWidth,
      });
    },
    //书写箭头的方法
    drawArrow(fromX, fromY, toX, toY, theta, headlen) {
      theta = typeof theta != "undefined" ? theta : 30;
      headlen = typeof theta != "undefined" ? headlen : 10;
      // 计算各角度和对应的P2,P3坐标
      let angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
        angle1 = ((angle + theta) * Math.PI) / 180,
        angle2 = ((angle - theta) * Math.PI) / 180,
        topX = headlen * Math.cos(angle1),
        topY = headlen * Math.sin(angle1),
        botX = headlen * Math.cos(angle2),
        botY = headlen * Math.sin(angle2);
      let arrowX = fromX - topX,
        arrowY = fromY - topY;
      let path = " M " + fromX + " " + fromY;
      path += " L " + toX + " " + toY;
      arrowX = toX + topX;
      arrowY = toY + topY;
      path += " M " + arrowX + " " + arrowY;
      path += " L " + toX + " " + toY;
      arrowX = toX + botX;
      arrowY = toY + botY;
      path += " L " + arrowX + " " + arrowY;
      return path;
    },
    downLoadImage() {
      this.done = true;
      //生成双倍像素比的图片
      let base64URl = this.fabricObj.toDataURL({
        formart: "png",
        multiplier: 2,
      });
      this.imageBase64 = base64URl;
      this.done = false;
      console.log(this.imageBase64, "this.imageBase64");
    },
  },
};
</script>

<style lang="scss" scoped>
.wraper {
  position: relative;
  width: 100%;
  height: 100%;
  .content_area{
    display: flex;
    .canvas-wraper {
      // height: 50%;
      // width: 100%;
      // margin-bottom: 10px;
      overflow: hidden;
      background: url("../assets/canvas_bg.jpg") repeat;
    }
    .controlPanel {
      // width: 100%;
      // height: 62px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-left: 1px solid #dad7d9;
      border-right: 1px solid #dad7d9;
      // background: #ddd;
      // margin-bottom: 15px;
      .contro-item {
        // flex-basis: 60px;
        // border-right: 1px solid #dad7d9;
        border-bottom: 1px solid #dad7d9;
        text-align: center;
        cursor: pointer;
        background: #fefefe;
        i {
          width: 50px;
          font-size: 38px;
          line-height: 50px;
        }
        &.active {
          background: #e34f51;
          color: #fff;
          border-radius: 3px;
          i {
            font-size: 42px;
          }
        }
      }
    }
  }
  .download {
    img {
      width: 100%;
    }
  }
}
</style>