import { ElMessage } from 'element-plus';
import clipboard3 from 'vue-clipboard3'

/**
 * 转义特殊字符
 * str: string: 需处理的字符串
 * reg: string: 需转义的特殊字符
 * 
 * @param reg 
 */
export function transferred(str: string, reg: string = "`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）;—|【】‘；：”“'。，、？") {
    let pattern = new RegExp("[" + reg + "]");
    let res = '';
    Array.from(str).forEach((char: any) => {
      res += char.replace(pattern, `\\${char}`);
    });
    return res;
}

/**
 * 复制文本
 * @param resStr 文本内容
 * @returns 
 */
export function copy(resStr: string) {
  try {
    //check
    if (resStr == '') {
      ElMessage({
        message: "无可复制内容",
        type: "warning",
        duration: 1500
      })
      return
    }
    //copy
    const {toClipboard} = clipboard3()
    toClipboard(resStr)
    ElMessage({
      message: "复制成功",
      type: "success",
      duration: 1500
    })
  } catch (error) {
    ElMessage({
      message: "复制失败",
      type: "error",
      duration: 1500
    })
  }
}

/**
 * 按指定字符生成随机字符串(场景：生成随机密码)
 * 
 * @param char 
 * @param length 
 * @returns 
 */
export function genRandomStrByChars(chars: string, length: number): string {
  let password = '';  
  for (let i = 0; i < length; i++) {  
    const randomIndex = Math.floor(Math.random() * chars.length);  
    password += chars[randomIndex];  
  }  
  return password;  
}

/**
 * 数字转中文
 * @param num 
 * @returns 
 */
export function numberToChinese(num: number, unit: string = '元'): string {
  const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿', '拾', '佰', '仟', '万'];  
  const chars = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];  
  let numStr = num.toString()
  
  if (numStr.includes('.')) {
    const parts = numStr.split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1]
    
    let result = ''
    
    if (integerPart && integerPart !== '0') {
      result += convertIntegerPart(integerPart, units, chars) + unit
    }
    
    if (decimalPart && decimalPart !== '0') {
      const decimalChars = ['角', '分']
      for (let i = 0; i < decimalPart.length && i < 2; i++) {
        const n = parseInt(decimalPart[i])
        if (n !== 0) {
          result += chars[n] + decimalChars[i]
        }
      }
    }
    
    return result || ('零' + unit)
  } else {
    const chinese = convertIntegerPart(numStr, units, chars)
    return chinese + unit
  }
}

function convertIntegerPart(numStr: string, units: string[], chars: string[]): string {
  let len = numStr.length
  if (len > 13) {
    ElMessage({
      message: "金额太大无法转换",
      type: "error",
      duration: 1500
    })
    return ''
  }
  let isZero = false;  
  let zeroCount = 0;  
  let chinese = ''

  for (let i = 0; i < len; i++) {  
    let n = parseInt(numStr[i]);  
    if (n === 0) {  
      isZero = true;  
      zeroCount++;  
    } else {  
      if (isZero) {  
        chinese += chars[0];  
      }  
      chinese += chars[n] + units[len - i - 1];  
      isZero = false;  
      zeroCount = 0;  
    }  
  }

  if (chinese.endsWith(chars[0])) {  
    chinese = chinese.substring(0, chinese.length - 1);  
  }  
  
  return chinese || '零'
}

//rtrim: 删除右侧指定字符， 默认删除空格
export function rtrim(str, char = ' ') {
    return str.replace(new RegExp('\\'+char+'+$', 'g'), '');
}

const StringUtils = {
  transferred,
  copy,
  genRandomStrByChars,
  numberToChinese,
  rtrim,
}

export default StringUtils