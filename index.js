import { readFile, readFileSync } from 'fs';
import {readPdfText} from 'pdf-text-reader';
import express from "express";
const app = express();

app.get('', (req, res)=>{
    readFile('./view/index.html', 'utf-8', (err, data)=>{
        res.send(data);
    });
});
app.get('/data', (req, res)=>{
    const path = "pdf/sample.pdf"; //CHANGE THE PATH HERE!!!!
    readPdfText({url: path}).then((data)=>{
        res.send({
            text: wordAppearanceChecker(data)
        });
    });
    
});

app.listen(8002, ()=>{
    console.log("get the API in localhost:3002");
})

// const txt = readFileSync('./index.js', 'utf-8');
// console.log(txt);

function wordAppearanceChecker(text){
    const list = text.replaceAll("\n", " ").replaceAll(/[!"\-—#$%“”‘’…&'()*+,.\/:;<=>?@[\]^_`{|}~]/g, "").toLowerCase().split(" ").filter(x=>x !== "").map(x=> ({word:x,count:1}) );

    function wordMatcher(list){
        
        if(list.length <= 1){
            return list;
        }

        const split = removeDecimal(list.length/2);
        let leftList =  wordMatcher( structuredClone(list.slice(0, split)) );
        let rightList = wordMatcher( structuredClone(list.slice(split)) );

        rightList.forEach(x => {
            let copy = x;

            for(let i = 0; i < leftList.length; i++){
                if(leftList[i].word === x.word){
                    copy = structuredClone(leftList[i]);
                    copy.count += x.count;
                    leftList = leftList.filter((x,index)=>index!=i);
                    break;
                }
            }
                
            let i = 0;
            while(1){
                if(leftList[i] === undefined || leftList[i] === null){
                    leftList = [  ...leftList, copy  ];
                    break;
                }

                if(leftList[i].count < copy.count){
                    leftList = [
                        ...structuredClone(leftList.slice(0, i)),
                        copy,
                        ...structuredClone(leftList.slice(i)),
                    ]
                    break;
                }

                i++;
            }
        });
        
        return leftList;
    }

    return wordMatcher(list);
}

function removeDecimal(number){
    let result = Math.floor(number);
    result = String(result);
    if(result.includes('.')){
        result = result.split(".");
        result = result[0];
    }
    result = Number(result);
    return result;
}
