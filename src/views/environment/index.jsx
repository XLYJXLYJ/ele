import React, { Component } from "react"
import { DataSet, DataView } from "@antv/data-set"
import G2 from "@antv/g2"

import CountUp from "react-countup"
import solarLunar from "../../assets/js/solarlunar"
import * as config from "../../config/index"
import * as tools from "../../tools/index"

import Swiper from 'swiper/js/swiper.js'
import 'swiper/css/swiper.min.css'

import "./index.scss"

// 跑马灯组件
class MarqueeWrap extends Component {
    constructor(props) {
        super(props)

        this.state = {
        visible: false
        }

        this.titleContainerDom = React.createRef()
        this.marqueeWrapDom = React.createRef()
    }
    componentDidMount() {
        this.initLayoutHandle()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.title !== this.props.title) {
        this.initLayoutHandle()
        }
    }

    initLayoutHandle() {
        let titleContainerDom = this.titleContainerDom.current
        let marqueeWrapDom = this.marqueeWrapDom.current

        let titleContainerVal = 0 // 目标值
        let marqueeWrapDomVal = 0 // 目标容器值

        if (
        this.props.marqueeDirection === "left" ||
        this.props.marqueeDirection === "right"
        ) {
        titleContainerVal = titleContainerDom.offsetWidth
        marqueeWrapDomVal = marqueeWrapDom.offsetWidth
        }
        if (
        this.props.marqueeDirection === "up" ||
        this.props.marqueeDirection === "down"
        ) {
        titleContainerVal = titleContainerDom.offsetHeight
        marqueeWrapDomVal = marqueeWrapDom.offsetHeight
        }
        if (titleContainerVal >= marqueeWrapDomVal) {
        // 目标值 大于 容器值  则动画开起
        this.setState({
            visible: true
        })
        } else {
        this.setState({
            visible: false
        })
        }
    }
    render() {
        let spanCss = Object.assign({}, this.props.styleCss, {
        opacity: this.state.visible ? 0 : 1
        })
        let showGradient = this.props.showGradient && this.state.visible // 是否显示渐变
        return (
        <div
            className={["marquee-wrap", showGradient ? "linear-gradient" : ""].join(
            " "
            )}
            ref={this.marqueeWrapDom}
        >
            <span
            ref={this.titleContainerDom}
            style={spanCss}
            className="marquee-wrap-container"
            >
            {this.props.title}
            </span>
            {this.state.visible ? (
            <marquee
                style={this.props.styleCss}
                className="marquee-wrap-marquee"
                behavior=""
                truespeed = "true"
                scrolldelay="300"
                direction={this.props.marqueeDirection}
                scrollamount={this.props.scrollamount}
            >
                {this.props.title}
            </marquee>
            ) : null}
        </div>
        )
    }
}
MarqueeWrap.defaultProps = {
  title: "",
  scrollamount: 2,
  marqueeDirection: "left", // 文本滚动的方向
  styleCss: {} // 文字样式
}

// 底部信息提示
class FooterInfoWrap extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
        <div className={"footer-infowrap"}>
            {this.props.footerInfoStatus === "updateVer" ? (
            <div className={"footer-main-info footer-main-updataver"}>
                <div className="info-img" />
                <span className="info-text">
                发现新版本，点击遥控器“确认”键升级。
                </span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "noNetwork" ? (
            <div className={"footer-main-info footer-main-nonetwork"}>
                <div className="info-img" />
                <span className="info-text">当前网络异常，请检查网络设置。</span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "networkAbnormal" ? (
            <div className={"footer-main-info footer-main-networkabnormal"}>
                <div className="info-img" />
                <span className="info-text">
                当前网络信号弱，请检查网络设置。
                </span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "serverPast" ? (
            <div className={"footer-main-info footer-main-serverpast"}>
                <div className="info-img" />
                <span className="info-text">
                服务已过期，请联系项目管理员续费。
                </span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "notBind" ? (
            <div className={"footer-main-info footer-main-serverpast"}>
                <div className="info-img" />
                <span className="info-text">
                未绑定设备，请联系项目管理员处理。
                </span>
            </div>
            ) : null}
            {this.props.footerInfoStatus === "urlSourceChange" ? (
            <div className={"footer-main-info footer-main-serverpast"}>
                <div className="info-img" />
                <span className="info-text">云屏源已切换。</span>
            </div>
            ) : null}
        </div>
        )
    }
}
FooterInfoWrap.defaultProps = {
    footerInfoStatus: ""
}

// 自定义 shape, 柱形图的圆角
G2.Shape.registerShape("interval", "borderRadius", {
    draw: function draw(cfg, container) {
        let points = cfg.points
        let path = []
        path.push(["M", points[0].x, points[0].y])
        path.push(["L", points[1].x, points[1].y])
        path.push(["L", points[2].x, points[2].y])
        path.push(["L", points[3].x, points[3].y])
        path.push("Z")
        path = this.parsePath(path) // 将 0 - 1 转化为画布坐标
        return container.addShape("rect", {
        attrs: {
            x: path[1][1], // 矩形起始点为左上角
            y: path[1][2],
            width: path[2][1] - path[1][1],
            height: path[0][2] - path[1][2],
            fill: cfg.color,
            radius: [(path[2][1] - path[1][1]) / 5, (path[2][1] - path[1][1]) / 5, 0, 0]
        }
        })
    }
})

// 主组件
class App extends Component {
  constructor(props) {
    super(props)
    this.proportionDom = React.createRef() //24小时报警次数饼图对象
    this.proportion24th = null //24小时报警次数饼图对象

    this.state = {
      projectName: "", // 项目名称
      logo: "", // logo图片
      slogan: "", // 头部公告
      localTime: "", // 本地时间
      oterInfoStatus: "", // 底部提示信息  noNetwork 无网 updateVer 版本更新networkAbnormal 网络异常serverPast 服务过期
      yunPingName: "", // 云屏服务名称
      yunPingCode: "", // 云屏设备码
      equipmentList: [], //设备列表
      equipmentListSlice:[], //处理后的设备列表数据
      warnTimes:'',//报警次数
      effectiveDeviceNum:'', //报警设备总数
      warnDeviceNum:'', //有效设备报警总数
      actionEquipmentListIndex: 0, // 选中当前设备
      warnStatistic: [], // 报警统计
    }
    // 18414220100155144  18414220100155130 huanjingjiance
    let deviceCode = tools.getUrlParam("deviceCode") || "18414220100155144"
    this.deviceCode = deviceCode // 设备码
    this.version = tools.getUrlParam("version") || "1.0" // 版本

    window.web_setNetWork = this.web_setNetWork
  }
  //组件将要渲染
  componentWillMount() {
    this.getBaseInfo()
    this.getDevice()
    this.updateLocalTime()
  }

  componentDidMount(){
    new Swiper('.swiper-container', {
      autoplay:true,
      delay:36000,
      slidesPerView: 1,
      spaceBetween: 0,
      observer: true,
      observeParents: true,
      setWrapperSize: true,
    }) 
  }
  //初始化24th 设备告警次数
  initProportion24th() {
    this.proportion24th && this.proportion24th.destroy()

    let _r = 255
    let _lineR = 255
    function pxRem(num) {
      return num / 38.4 + "rem"
    }
    let startAngle = -Math.PI/2 - Math.PI //开始角度
    console.log(this.proportionDom)
    if(this.proportionDom.current != null){
      var height = this.proportionDom.current.offsetHeight+20
    }

    let indexVal = this.state.equipmentList[this.state.actionEquipmentListIndex].orderProductList //选中值
    let total = Object.assign([], this.state.equipmentList).reduce((a, b) => {
      return a + b.alarmTimes
    }, 0)

    let copyData = JSON.parse(JSON.stringify(this.state.equipmentList))
    let equipmentList = [];
    copyData.map(item =>{
      if(item.alarmTimes==0 || item.bindStatus==4){ //报警次数为0 或 未绑定
        return false
      }else{
        equipmentList.push(item);
      }
    })

    if(equipmentList.length<=0){
      return;
    }

    //所有设置报警次数都是等于0  :平分甜甜圈🍩
    let isAllZeo = equipmentList.every(e => e.alarmTimes == 0)
    isAllZeo && equipmentList.forEach(e => e.alarmTimes = 10)

    if (this.state.actionEquipmentListIndex != 0) {
      equipmentList.splice(0, 0, equipmentList.splice(this.state.actionEquipmentListIndex, 1)[0]) //选中设备放到数组第一位
    }

    let ds = new DataSet()
    let dv = ds.createView().source(equipmentList)
    dv.transform({
      type: "percent",
      field: "alarmTimes",
      dimension: "deviceName",
      as: "percent"
    })
    this.proportion24th = new G2.Chart({
      container: "proportion-24th",
      forceFit: true,
      height: height,
      padding: [10, 100, 30, 0]
    })

    this.proportion24th.source(equipmentList)
    this.proportion24th.legend(false)
    this.proportion24th.coord("theta", {
      radius: 0.81,
      innerRadius: 0.64,
      startAngle,
      endAngle: startAngle + Math.PI * 2
    })
    //中间统计数字
    this.proportion24th.guide().html({
      position: ["50%", "50%"],
      html: `<div style="color:#fff;font-size: ${pxRem(28)};margin-top:2px;text-align: center;width: 10em;font-weight:normal">${total}</div>`,
      alignX: "middle",
      alignY: "middle"
    })

    this.proportion24th
      .intervalStack()
      .position("alarmTimes")
      .color("orderProductList", a => {
        if (a == indexVal) {
          return "rgba(0,0,0,0)"
        } else {
          let rgb = `rgb(${_r}, ${_r}, ${_r})`
          if(_r>50){
            _r = _r - 50
          }else{
            _r = 250
          }
          return rgb
        }
      })
      .label("alarmTimes*orderProductList", (a, b) => {
        return b == indexVal
          ? {
            formatter: value => {
                return isAllZeo ? "0" : value
            },
            offset: -2,
            autoRotate: false,
            textStyle: {
              fill: "#000",
              textBaseline: 'middle',
              textAlign: 'center',
              fontSize: 8
            }
          }
          : null
      })
      .select(false)
      .style({
        lineWidth: 0
      })
    let outterView = this.proportion24th.view()
    let dv1 = new DataView()
    dv1.source(equipmentList).transform({
      type: "percent",
      field: "alarmTimes",
      dimension: "deviceName",
      as: "percent"
    })
    outterView.source(dv1)
    outterView.coord("theta", {
      radius: 1,
      innerRadius: 0.52,
      startAngle,
      endAngle: startAngle + Math.PI * 2
    })
    outterView
      .intervalStack()
      .position("percent")
      .color("orderProductList", a => {
        return a == indexVal ? "#fcb813" : "rgba(0,0,0,0)"
      }).opacity(1)
      .select(false)
      .style({
        lineWidth: 0
      })

    this.proportion24th.render()

    let OFFSET = 0 //控制第一次折线长度
    let APPEND_OFFSET = 95 //控制第二次折线的长度  越小越长
    let LINEHEIGHT = 20 //行高 - 让数据平均分布
    let yellowAngle = .6 //黄色环第一次折线角度
    let coord = this.proportion24th.get("coord") // 获取坐标系对象
    let center = coord.center // 极坐标圆心坐标
    let r = coord.radius // 极坐标半径
    let canvas = this.proportion24th.get("canvas")
    let canvasWidth = this.proportion24th.get("width")
    let canvasHeight = this.proportion24th.get("height")
    let labelGroup = canvas.addGroup()
    let labels = []
    addPieLabel(this.proportion24th)
    canvas.draw()
    //main
    function addPieLabel() {
      let halves = [[], []]
      let data = dv.rows
      let angle = startAngle
      let fill = "#fcb813"
      for (let i = 0; i < data.length; i++) {
        let isYellow = data[i].orderProductList == indexVal //黄色部分
        OFFSET = isYellow ? OFFSET : 5 //控制第一次折线长度
        let percent = data[i].percent
        let targetAngle = angle + Math.PI * 2 * percent
        let middleAngle =
          angle + (isYellow ? 0 : (targetAngle - angle) / 3) //调节高度间隔
        angle = targetAngle
        let edgePoint = getEndPoint(center, middleAngle, r + (isYellow ? 5 : 0))//折线离环的距离
        let routerPoint = getEndPoint(center, middleAngle - (isYellow ? yellowAngle : 0), r + OFFSET)
        if (isYellow) {
          fill = "#fcb813"
        } else {
          fill = `rgb(${_lineR}, ${_lineR}, ${_lineR})`
          _lineR = _lineR - 50
        }

        //label
        let label = {
          _anchor: edgePoint,
          _router: routerPoint,
          _data: data[i],
          x: routerPoint.x,
          y: routerPoint.y,
          r: r + OFFSET,
          fill
        }
        // 判断文本的方向
        label._side = "left"
        halves[0].push(label)
      } // end of for

      let maxCountForOneSide = parseInt(canvasHeight / LINEHEIGHT, 10)
      halves.forEach(function (half, index) {
        // step 2: reduce labels
        if (half.length > maxCountForOneSide) {
          half.sort(function (a, b) {
            return b._percent - a._percent
          })
          half.splice(maxCountForOneSide, half.length - maxCountForOneSide)
        }

        // step 3: distribute position (x and y)
        half.sort(function (a, b) {
          return a.y - b.y
        })
        antiCollision(half, index)
      })
    }

    function getEndPoint(center, angle, r) {
      return {
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      }
    }

    function drawLabel(label) {
      let _anchor = label._anchor,
        _router = label._router,
        fill = label.fill,
        y = label.y
      let labelAttrs = {
        y: y,
        fontSize: 8.5, // 字体大小
        fill: "#ccc",
        text: label._data.deviceName,
        textBaseline: "middle"
      }
      let lastPoint = {
        y: y
      }
      lastPoint.x = canvasWidth - APPEND_OFFSET
      labelAttrs.x = canvasWidth - 90 // 右侧文本右对齐并贴着画布最右侧边缘
      labelAttrs.textAlign = "left"
      // 绘制文本
      let text = labelGroup.addShape("Text", {
        attrs: labelAttrs
      })
      labels.push(text)
      // 绘制连接线
      let points = void 0
      if (_router.y !== y) {
        // 文本位置做过调整
        points = [
          [_anchor.x, _anchor.y],
          [_router.x, y],
          [lastPoint.x, lastPoint.y]
        ]
      } else {
        points = [
          [_anchor.x, _anchor.y],
          [_router.x, _router.y],
          [lastPoint.x, lastPoint.y]
        ]
      }

      labelGroup.addShape("polyline", {
        attrs: {
          points: points,
          lineWidth: 1,
          stroke: fill
        }
      })
    }
    // 防重叠
    function antiCollision(half, isRight) {
      let startY = center.y - r - OFFSET - LINEHEIGHT
      let overlapping = true
      let totalH = canvasHeight
      let i = void 0

      let maxY = 0
      let minY = Number.MIN_VALUE
      let boxes = half.map(function (label) {
        let labelY = label.y
        if (labelY > maxY) {
          maxY = labelY
        }
        if (labelY < minY) {
          minY = labelY
        }
        return {
          size: LINEHEIGHT,
          targets: [labelY - startY]
        }
      })
      if (maxY - startY > totalH) {
        totalH = maxY - startY
      }

      while (overlapping) {
        boxes.forEach(function (box) {
          let target =
            (Math.min.apply(minY, box.targets) +
              Math.max.apply(minY, box.targets)) /
            2
          box.pos = Math.min(
            Math.max(minY, target - box.size / 2),
            totalH - box.size
          )
        })

        // 检测重叠和连接框
        overlapping = false
        i = boxes.length
        while (i--) {
          if (i > 0) {
            let previousBox = boxes[i - 1]
            let box = boxes[i]
            if (previousBox.pos + previousBox.size > box.pos) {
              // 重叠
              previousBox.size += box.size
              previousBox.targets = previousBox.targets.concat(box.targets)

              // 溢出,转变
              if (previousBox.pos + previousBox.size > totalH) {
                previousBox.pos = totalH - previousBox.size
              }
              boxes.splice(i, 1) // 删除盒子
              overlapping = true
            }
          }
        }
      }

      // step 4: 将y标准化并调整x
      i = 0
      boxes.forEach(function (b) {
        let posInCompositeBox = startY // 标签居中
        b.targets.forEach(function () {
          half[i].y = b.pos + posInCompositeBox + LINEHEIGHT / 2
          posInCompositeBox += LINEHEIGHT
          i++
        })
      })

      // (x - cx)^2 + (y - cy)^2 = totalR^2
      half.forEach(function (label) {
        let rPow2 = label.r * label.r
        let dyPow2 = Math.pow(Math.abs(label.y - center.y), 2)
        if (rPow2 < dyPow2) {
          label.x = center.x
        } else {
          let dx = Math.sqrt(rPow2 - dyPow2)
          if (!isRight) {
            // left
            label.x = center.x - dx
          } else {
            // right
            label.x = center.x + dx
          }
        }
        drawLabel(label)
      })
    }
  }

  // 初始化设备列表
  initEquipmentList() {
    // 没有数据情况下
    if (!this.state.equipmentList.length) {
      console.log(123)
      this.setState({
        actionEquipmentListIndex: 0,
        equipmentList: []
      })
      window.clearInterval(this.equipmentListTime)

      this.equipmentListTime = null
      return null
    }
    if (this.equipmentListTime) {
      console.log(456)
      return null
    }
    let updateTime = this.state.equipmentList.length == 1 ? 60 : 5
    //切换时间
    // let updateTime = 200
    this.updateDate('init')
    this.equipmentListTime = setInterval(() => {
      console.log(789)
      if (
        this.state.actionEquipmentListIndex <
        this.state.equipmentList.length - 1
      ) {
        this.setState(
          {
            actionEquipmentListIndex: (this.state.actionEquipmentListIndex += 1)
          },
          this.updateDate
        )
      } else {
        this.setState(
          {
            actionEquipmentListIndex: 0
          },
          this.updateDate
        )
      }

    }, 1000 * updateTime)

  }

  //更新接口数据
  updateDate(type) {
    !type && this.getBaseInfo()
    !type && this.getDevice()
    this.getWarnStatistic()
  }
  //获取设备信息
  getDevice() {
    this.$http
      .post("/rest/elec/getDevice", { deviceCode: this.deviceCode })
      .then(re => {
        let res = re.data
        if (res.status == 200) {
          let data = res.response
          let length = data.deviceList.length
          //数据分组-每12个一组
          let curSwiperDataArr=[];
          let groupSize = [];
          console.log(data)

          let warnDeviceNumData = data.warnDeviceNum // 报警设备
          let effectiveDeviceNumData = data.effectiveDeviceNum // 设备总数

          for(let j=0;i<effectiveDeviceNumData;i++){
              if(data[i].staus == 2){
                let a = data.slice(i,i+1) // 截取报警的数据
                data.unshift(a) // 将报警的数据丢在前头
              }
          }

          if(warnDeviceNumData == 0 ){
            for(let i = 0;i<effectiveDeviceNumData;i+12){
              groupSize.push(12);
            }
          }else if(warnDeviceNumData <= 6){
            for(let i = 0;i<(effectiveDeviceNumData-warnDeviceNumData)/12;i+1){
              if(i = 0){
                groupSize.push(12-warnDeviceNumData);
              }else{
                groupSize.push(12);
              }
            }
          }else if(warnDeviceNumData > 6 && warnDeviceNumData <= 12){
            for(let i = 0;i<(effectiveDeviceNumData-warnDeviceNumData)/12;i+1){
              if(i = 0){
                groupSize.push(6);
              }else if(i = 1){
                groupSize.push(18-warnDeviceNumData);
              }else{
                groupSize.push(12);
              }
            }
          }
          else if(warnDeviceNumData > 12 && warnDeviceNumData <= 18){
            for(let i = 0;i<(effectiveDeviceNumData-warnDeviceNumData)/12;i+1){
              if(i = 0){
                groupSize.push(6);
              }else if(i = 1){
                groupSize.push(6);
              }else if(i = 2){
                groupSize.push(24-warnDeviceNumData);
              }else{
                groupSize.push(12);
              }
            }
          }
          else if(warnDeviceNumData > 18 && warnDeviceNumData <= 24){
            for(let i = 0;i<(effectiveDeviceNumData-warnDeviceNumData)/12;i+1){
              if(i = 0){
                groupSize.push(6);
              }else if(i = 1){
                groupSize.push(6);
              }else if(i = 2){
                groupSize.push(6);
              }else if(i = 3){
                groupSize.push(30-warnDeviceNumData);
              }else{
                groupSize.push(12);
              }
            }
          }
          else if(warnDeviceNumData > 24){
            for(let i = 0;i<(effectiveDeviceNumData-warnDeviceNumData)/6;i+1){
              if(i = effectiveDeviceNumData/6 - 2){
                groupSize.push(6);
              }else if(i = effectiveDeviceNumData/6 - 1){
                groupSize.push(30-warnDeviceNumData);
              }else{
                groupSize.push(12);
              }
            }
          }

          for (let i = 0, j = effectiveDeviceNumData; i < j; i += groupSize[i]) {
            curSwiperDataArr.push(data.deviceList.slice(i, i + groupSize[i]));
          }
          // 对数据进行处理，发光的设备和设备排列的规则
          curSwiperDataArr.map((item,index) => {
            let iLength = item.length
            item.map((item1,index1)=>{
              if(iLength<7){
                item1['long'] = 1;
              }
              else if(iLength > 6 && iLength < 13){
                if(index1 < 12-iLength){
                  item1['long'] = 1;
                }else{
                  item1['long'] = 0;
                }
              }
              if(this.state.actionEquipmentListIndex<12){
                if(index1 == this.state.actionEquipmentListIndex){
                  item1['shine'] = 1;
                }else{
                  item1['shine'] = 0;
                }
              }else{
                this.state.actionEquipmentListIndex = this.state.actionEquipmentListIndex % 12
                if(index1 == this.state.actionEquipmentListIndex){
                  item1['shine'] = 1;
                }else{
                  item1['shine'] = 0;
                }
              }
            })
          })

          //数据分组-每6个一组
          // let curSwiperDataArr=[];
          // let groupSize = 6;
          // for (let i = 0, j = length; i < j; i += groupSize) {
          //   curSwiperDataArr.push(data.deviceList.slice(i, i + groupSize));
          // }
          // curSwiperDataArr.map((item,index) => {
          //     let iLength = item.length
          //     item.map((item1,index1)=>{
          //       if(iLength<3){
          //         item1['long'] = 1;
          //       }
          //       else if(iLength > 2 && iLength < 7){
          //         if(index1 < 6-iLength){
          //           item1['long'] = 1;
          //         }else{
          //           item1['long'] = 0;
          //         }
          //       }
          //     })
          // })
          this.setState(
            {
              equipmentListSlice: curSwiperDataArr,
              equipmentList: data.deviceList,
              warnTimes:data.warnTimes,
              effectiveDeviceNum:data.effectiveDeviceNum,
              warnDeviceNum:data.warnDeviceNum
            },
            () => {
                // 如果设备未绑定
                if (!this.state.equipmentList[this.state.actionEquipmentListIndex].deviceCode) {
                    this.setState({
                        footerInfoStatus: 'notBind'
                    })
                } else {
                    if (this.state.footerInfoStatus  == 'notBind') {
                        this.setState({
                            footerInfoStatus: ''
                        })
                    }
                }
                this.initEquipmentList()
                // if(this.state.equipmentList.length > 0 && this.state.equipmentList[this.state.actionEquipmentListIndex].alarmTimes > 0){
                //   this.initProportion24th()
                // }
            }
          )
        }
      }).catch(error => {
        console.log(error)
        if (this.state.footerInfoStatus !== 'noNetwork') {
            this.setState({
                footerInfoStatus: 'networkAbnormal',
            })
        }
    })
  }
  //获取基础信息
  getBaseInfo() {
    //  网络异常
    if (!navigator.onLine) {
        this.setState({
            footerInfoStatus: 'noNetwork',
        })
    }
    this.$http
      .post("/rest/elec/getTvBasicInfo", {
        deviceCode: this.deviceCode,
        version: this.version
      })
      .then(re => {
        let res = re.data
        if (res.status == 200) {
          let data = res.response
          let footerInfoStatus = ''
          // 设备已解绑状态
          if (window.Number(data.yunPingStatus) === 2) {
            config.android && config.android.setBinding();
          }
          //云屏源已切换(需调用android接口,发起重新绑定长连接)
          else if (window.Number(data.yunPingStatus) === 3) {
            footerInfoStatus = 'urlSourceChange';
            config.android && config.android.destroyWeb();
          }
          // 无数据源
          else if (window.Number(data.yunPingStatus) === 4) {
            this.setState({
              footerProjectInfo: data.yunPingName + " | " + data.yunPingCode,
              footerInfoStatus: "noData",
              serverData: null
            });
          }
          // 服务已过期
          else if (window.Number(data.yunPingStatus) === 5) {
            footerInfoStatus = 'serverPast'
          }
          this.setState({
            projectName: data.projectName,
            slogan: data.slogan,
            yunPingName: data.yunPingName,
            yunPingCode: data.yunPingCode,
            footerInfoStatus,
            logo: data.logo
          })
        }
      }).catch(error => {
        console.log(error)
        if (this.state.footerInfoStatus !== 'noNetwork') {
          this.setState({
              footerInfoStatus: 'networkAbnormal',
          })
        }
    })
  }

  //报警统计
  getWarnStatistic() {
    this.$http
      .post("/rest/elec/getIndicatorWarnTimes", {
        orderProductList: this.state.equipmentList[
          this.state.actionEquipmentListIndex
        ].orderProductList,
        deviceCode: this.deviceCode
      })
      .then(re => {
        let res = re.data
        if (res.status == 200) {
          let data = res.response
          console.log(data)
          this.setState({
            warnStatistic: data
          })
        }
      }).catch(error => {
        console.log(error)
        if (this.state.footerInfoStatus !== 'noNetwork') {
            this.setState({
                footerInfoStatus: 'networkAbnormal',
            })
        }
    })
  }
  // 更新本地显示时间
  updateLocalTime() {
    setInterval(() => {
      let dataObj = new Date()
      let nongLi = solarLunar.solar2lunar(
        dataObj.getFullYear(),
        dataObj.getMonth() + 1,
        dataObj.getDate()
      )
      let time =
        tools.momentFormat(dataObj.getTime(), "LL") +
        ` 农历${nongLi.monthCn}${nongLi.dayCn}` +
        " " +
        tools.momentFormat(dataObj.getTime(), "dddd") +
        " " +
        tools.momentFormat(dataObj, "HH:mm:ss")
      this.setState({
        localTime: time
      })
    }, 1000)
  }
  render() {
    return (
      <div className="app-wrap">
        <div className="app-header">
          <div className="app-container">
            <div className="app-header-info">
              <div className="header-info-tag">
                {this.state.projectName ? (
                  <MarqueeWrap title={this.state.projectName} />
                ) : null}
              </div>
              <div
                className="header-info-time"
                dangerouslySetInnerHTML={{ __html: this.state.localTime }}
              />
            </div>
          </div>
        </div>

        <div className="app-content">
          <div className="app-content-left">
            <div className="swiper-container">
                <div className="swiper-wrapper">
                  {
                    this.state.equipmentListSlice.map((itemMain,intexMain) => {
                      return(
                        <div className="swiper-slide" key={intexMain}>
                        <ul className='app-content-left-ul'>
                        {
                          itemMain.map((item,index) => {
                            return(
                            <div key={index}>
                              <li className={item.status == 2 ? "app-content-left-li active" : "app-content-left-li"} style={{display:item.long == 1?'':'none'}}>
                                <div className="left">
                                  <img src={require("../../assets/images/cdz.png")}  alt=""/>
                                  <p className="one">
                                  {item.deviceName} <img className={item.status == 2 ? "" : "active1"} src={require("../../assets/images/warnMarker.png")} alt=""/>
                                  </p>
                                  <div className="two">
                                  <MarqueeWrap
                                      title={item.address || '-'}
                                  />
                                  </div>
                                  <p className="three">设备码 {item.deviceCode}</p>
                                  {/* <p>{item.indicatorList}</p> */}
                                </div>
                                <div className="right">
                                  <ul>
                                    {
                                      item.indicatorList.map((item1,index1) => {
                                        return(
                                          (this.state.footerInfoStatus != 'notBind' && this.state.footerInfoStatus != 'serverPast')?
                                          <li  key={index1} className={item1.status == 0 ? "left-supervise-list" : "left-supervise-list active"}>
                                          <p className={item1.status == 1 ? "one upIcon" : item1.status == -1 ? "one lowIcon" : 'one'}>{item1.indicatorName}</p>
                                          <p className="three">
                                            <CountUp
                                              start={0}
                                              end={item1.indicatorValue}
                                              decimals={0}
                                              duration={2.5}
                                              useEasing={true}
                                              useGrouping={true}
                                            />
                                            <span className="four">{item1.unit}</span></p>
                                            <p className="five">{item1.statusName?item1.statusName:''}</p>
                                          </li>:
                                          <li key={index1} className={item1.status == 0 ? "left-supervise-list" : "left-supervise-list"}>
                                          <p className={item.status == 1 ? "one" : item.status == -1 ? "one" : 'one'}>{item1.indicatorName}</p>
                                          <p className="three">-</p>
                                          </li>
                                          )
                                        })
                                      }
                                    </ul>
                                </div>
                              </li>

                                <li className={`${item.long == 1 ? "app-content-left-li-1 no-show" : "app-content-left-li-1"} ${item.status == 2 ? "active2" : ""}` }>
                                  <div className="left">
                                      <img src={require("../../assets/images/cdz.png")}  alt=""/>
                                      <p className="one"> {item.deviceName}<img className={item.status == 2 ? "" : "active1"}  src={require("../../assets/images/warnMarker.png")} alt=""/></p>
                                      <div className="two">       
                                      <MarqueeWrap
                                          title={item.address || '-'}
                                      /></div>
                                      {(this.state.footerInfoStatus != 'notBind' && this.state.footerInfoStatus != 'serverPast')? <p className="three">设备码 {item.deviceCode} <span>&nbsp;&nbsp;</span> 电缆温度: {item.indicatorList[2].indicatorValue}{item.indicatorList[2].indicatorValue?'°C':''} <span>&nbsp;&nbsp;</span>漏电量: {item.indicatorList[3].indicatorValue}{item.indicatorList[3].indicatorValue?'mA':''} <span>&nbsp;&nbsp;</span> 耗电量: {item.indicatorList[4].indicatorValue}{item.indicatorList[4].indicatorValue?'kw·h':''}</p>:
                                      <p className="three">设备码 {item.deviceCode} <span>&nbsp;&nbsp;</span> 电缆温度: - <span>&nbsp;&nbsp;</span>漏电量: - <span>&nbsp;&nbsp;</span> 耗电量: -</p>}
                                    
                                    </div>

                                    {(this.state.footerInfoStatus != 'notBind' && this.state.footerInfoStatus != 'serverPast')?  
                                    <p className="voltage">
                                    <CountUp
                                      start={0}
                                      end={item.indicatorList[0].indicatorValue}
                                      decimals={0}
                                      duration={2.5}
                                      useEasing={true}
                                      useGrouping={true}
                                    />
                                    <span style={{fontSize:`10px`}}>{item.indicatorList[0].indicatorValue?'V':''}</span>
                                    </p>: ''}
                                    

                                    {(this.state.footerInfoStatus != 'notBind' && this.state.footerInfoStatus != 'serverPast')? 
                                    <p className="current">
                                    <CountUp
                                      start={0}
                                      end={item.indicatorList[1].indicatorValue}
                                      decimals={2}
                                      duration={2.5}
                                    />
                                    <span style={{fontSize:`10px`}}>{item.indicatorList[1].indicatorValue?'A':''}</span>
                                    </p>:<p className="current">-</p>}
        

                                </li>
                     


                            </div>
                            )
                          })
                              }
                          </ul>
                        </div>
                      )
                    })
                  }
                </div>
            </div>
          </div>

          <div className="app-content-right">
            <div className="warn-info-title">报警信息统计</div>
            <div className="warn-info-value">
              <div className="warn-day">
                <div className="warn-day-num">
                {(this.state.footerInfoStatus != 'notBind' && this.state.footerInfoStatus != 'serverPast') ? 
                    (!this.state.effectiveDeviceNum || this.state.effectiveDeviceNum == 0? (
                        '0'
                    ) : (
                      <span>       
                         <CountUp
                            start={0}
                            end={this.state.warnDeviceNum}
                            decimals={0}
                            duration={2.5}
                            useEasing={true}
                            useGrouping={true}
                        />
                        <span style={{fontSize:`12px`}}>
                        /
                        <CountUp
                            start={0}
                            end={this.state.effectiveDeviceNum}
                            decimals={0}
                            duration={2.5}
                            useEasing={true}
                            useGrouping={true}
                        />
                        </span>
                      </span>
                      )):'-'
                    }
                </div>
                <div className="warn-day-name">报警/设备总数</div>
              </div>
              <div className="warn-time">
                <div className="warn-time-num">
                {(this.state.footerInfoStatus != 'notBind' && this.state.footerInfoStatus != 'serverPast')? 
                    (!this.state.warnTimes || this.state.warnTimes ==0 ? (
                      '0'
                    ) : (
                        <CountUp
                            start={0}
                            end={this.state.warnTimes}
                            decimals={0}
                            duration={2.5}
                            useEasing={true}
                            useGrouping={true}
                        />
                        )):'-'
                }
                </div>
                <div className="warn-time-name">24 小时报警次数</div>
              </div>
            </div>
            <div className="warn-24th-title">24 小时报警次数占比图</div>
            <div className="warn-24th-chart">
              {this.state.equipmentList && this.state.equipmentList.length > 0 && this.state.equipmentList[this.state.actionEquipmentListIndex].alarmTimes > 0 ?
                <div ref={this.proportionDom} id="proportion-24th" /> : "-"
              }
            </div>
            <div className="warn-24th-numtitle">各指标 24 小时报警次数</div>
            <div className="warn-24th-list">
              {this.state.warnStatistic
                ? this.state.warnStatistic.map(
                  (item, index) => {
                    return (
                      <div className="warn-24th-li" key={index}>
                        <div className="warn-num">
                          <span className="warn-name">
                            {item.indicatorName}
                          </span>
                          <span className="warn-total-num">
                            <CountUp
                              start={0}
                              end={item.alarmTimes}
                              decimals={0}
                              duration={2.5}
                              useEasing={true}
                              useGrouping={true}
                            />
                          </span>
                        </div>
                        <div className="warn-total">
                            <div
                              className="warn-proportion"
                              style={{
                                width: `${item.alarmTimes / item.totalTimes * 100}%`
                              }}
                            />
                        </div>
                      </div>
                    )
                  }
                )
                : "-"}
            </div>
          </div>
        </div>

        <div className="app-footer">
          <div className="app-footer-main">
            <FooterInfoWrap footerInfoStatus={this.state.footerInfoStatus} />
          </div>
          <div className="app-footer-version">
            {this.state.yunPingName}{" "}
            {this.state.yunPingCode ? (
              <span>
                <span className="split">| </span>
                <span>设备码</span>
              </span>
            ) : null}{" "}
            {this.state.yunPingCode}
          </div>
          <div className="app-footer-logo">
            {
              this.state.logo && <img src={this.state.logo} alt="Logo" className="footerLogo" />
            }
          </div>
        </div>
      </div >
    )
  }
}
export default App
