#!/usr/bin/env node
const request= require('request');
const cheerio=require('cheerio');
const fs=require('fs');
let $
let data={}

function getGithub(error, response, body) {
    if(error){
        console.error("error: ",error)
    }
    else{
        if(response.statusCode==200){
            $=cheerio.load(body)
            let allTopics=$(".no-underline.d-flex.flex-column.flex-justify-center");
            let allTopicsName=$(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1");
            for(let i=0;i<allTopics.length;i++){
                let topicUrl="https://github.com/"+$(allTopics[i]).attr('href')
                let topicName=$(allTopicsName[i]).text().trim()
                getGithubTopics(topicUrl,topicName)
            }
        }else{
            console.log("Some error occured while fetching github url: "+url)
        }
    }
  }

  function getGithubTopics(url,name){
      request(url,function(error,response,body){
        if(error){
            console.error("error: ",error)
        }
        else{
            if(response.statusCode==200){
                $=cheerio.load(body)
                let allProjects=$(".f3.color-text-secondary.text-normal.lh-condensed .text-bold")
                allProjects=allProjects.slice(0,8)
                for(let x=0;x<allProjects.length;x++){
                    let projectTitle=$(allProjects[x]).text().trim()
                    let projectUrl="https://github.com/"+$(allProjects[x]).attr('href')
                    if(data[name]){
                        data[name].push({projectTitle,projectUrl})
                    }else{
                        data[name]=[{projectTitle,projectUrl}]
                    }
                    getProjectIssues(projectUrl+"/issues",projectTitle,name)
                }
            }else{
                console.log("Some error occured while fetching project url: "+url)
            }
        }
      })
  }

  function getProjectIssues(url,projectTitle,topic){
      request(url,function(error,response,body){
          if(error){
              console.error("error: ",error);
          }else{
              if(response.statusCode==200){
                  $=cheerio.load(body)
                  let allIssues=$(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open")
                  for(let x=0;x<allIssues.length;x++){
                      let issueTitle=$(allIssues[x]).text().trim()
                      let issueUrl="https://github.com/"+$(allIssues[x]).attr('href')
                      let index=-1;
                      for(let i=0;i<data[topic].length;i++){
                          if(data[topic][i].projectTitle==projectTitle){
                              index=i;
                              break;
                          }
                      }
                      if(data[topic][index]["issue"]){
                          data[topic][index]["issue"].push({issueTitle,issueUrl})
                      }else{
                          data[topic][index]["issue"]=[{issueTitle,issueUrl}]
                      }
                  }
                  fs.writeFileSync("data.json",JSON.stringify(data))
              }else{
                  console.log("Some error occured while fetching project issue url: "+url);
              }
          }
      })
  }

request('https://github.com/topics',getGithub);