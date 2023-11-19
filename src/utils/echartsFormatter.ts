import { BillingItem } from '../../electron/network/billing-parser/BillingParser';

export function getBillingsEchartOptions(billingItem: BillingItem[]) {
    const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: ${c} ({d}%)'
        },
        legend: {
          data: [
            '升级包',
            '涂装',
            '订阅',
            '舰船',
            '其他'
          ]
        },
        toolbox: {
            feature: {
              saveAsImage: {},
            },
            magicType: {
                type: ['line', 'bar', 'stack']
            }
        },
        series: [
          {
            name: '支付方式',
            type: 'pie',
            selectedMode: 'single',
            radius: [0, '30%'],
            label: {
              position: 'inner',
              fontSize: 14
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 1548, name: '现金' },
              { value: 775, name: '信用点' },
            ]
          },
          {
            name: '商品类型',
            type: 'pie',
            radius: ['45%', '60%'],
            labelLine: {
              length: 30
                // show: false
            },
            label: {
                // position: 'inner',
                fontSize: 14
            },
            // label: {
            //   formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
            //   backgroundColor: '#F6F8FC',
            //   borderColor: '#8C8D8E',
            //   borderWidth: 1,
            //   borderRadius: 4,
            //   rich: {
            //     a: {
            //       color: '#6E7079',
            //       lineHeight: 22,
            //       align: 'center'
            //     },
            //     hr: {
            //       borderColor: '#8C8D8E',
            //       width: '100%',
            //       borderWidth: 1,
            //       height: 0
            //     },
            //     b: {
            //       color: '#4C5058',
            //       fontSize: 14,
            //       fontWeight: 'bold',
            //       lineHeight: 33
            //     },
            //     per: {
            //       color: '#fff',
            //       backgroundColor: '#4C5058',
            //       padding: [3, 4],
            //       borderRadius: 4
            //     }
            //   }
            // },
            data: [
              { value: 1548, name: '升级包' },
              { value: 775, name: '涂装' },
              { value: 679, name: '订阅'},
              { value: 1548, name: '舰船' },
              { value: 775, name: '其他' },
            ]
          }
        ]
      };
    let total_credit_used = 0
    let total_cash_used = 0
    let total_upgrade_price = 0
    let total_ship_price = 0
    let total_skin_price = 0
    let total_subscription_price = 0
    let total_other_price = 0
    billingItem.forEach((item) => {
        total_credit_used += item.credit_used
        total_cash_used += item.total
        for (const billing_item of item.items) {
            if (billing_item.name.includes('Upgrade')) {
                total_upgrade_price += billing_item.price
            } else if (billing_item.name.includes('Standalone Ship')) {
                total_ship_price += billing_item.price
            } else if (billing_item.name.includes('Paint') || billing_item.name.includes('Skin') || billing_item.name.includes('paint')) {
                total_skin_price += billing_item.price
            } else if (billing_item.name.includes('Subscrib')) {
                total_subscription_price += billing_item.price
            } else {
                if (isNaN(billing_item.price)) {
                  console.log(billing_item)
                  continue
                }
                total_other_price += billing_item.price
            }
        }
    })
    option.series[0].data[0].value = total_cash_used / 100
    option.series[0].data[1].value = total_credit_used / 100
    option.series[1].data[0].value = total_upgrade_price / 100
    option.series[1].data[1].value = total_skin_price / 100
    option.series[1].data[2].value = total_subscription_price / 100
    option.series[1].data[3].value = total_ship_price / 100
    option.series[1].data[4].value = total_other_price / 100

    // console.log(option)
    return option
}


export function getTimeBillingEchartOptions(billingItem: BillingItem[]) {
    const option = {
        // title: {
        //   text: 'Stacked Area Chart'
        // },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['信用点', '现金'],
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        dataZoom: [
            {
              show: true,
              realtime: true,
              start: 70,
              end: 100,
              xAxisIndex: [0, 1]
            }
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '信用点',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
            name: '现金',
            type: 'line',
            stack: 'Total',
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            data: [220, 182, 191, 234, 290, 330, 310]
          }
        ]
      };
    const timeData = []
    const creditData = []
    const cashData = []
    const timeMap = new Map<string, number[]>()
    billingItem.forEach((item) => {
        const date = new Date(item.time)
        const day = date.getDate()
        const formattedDay = `${date.getFullYear()}-${date.getMonth() + 1}-${day}`
        if (timeMap.has(formattedDay)) {
            const priceData = timeMap.get(formattedDay)
            timeMap.set(formattedDay, [priceData[0] + item.credit_used, priceData[1] + item.total])
        } else {
            timeMap.set(formattedDay, [0, 0])
        }
    })
    timeMap.forEach((value, key) => {
        timeData.push(key)
        creditData.push(value[0] / 100)
        cashData.push(value[1] / 100)
    })
    option.xAxis[0].data = timeData.reverse()
    option.series[0].data = creditData.reverse()
    option.series[1].data = cashData.reverse()
    return option
}