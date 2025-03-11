import React from 'react'

const BigLine = ({ className = ''}) => {
  return (
    <div className={`border-[5px] border-[#603913] w-full ${className}`}></div>
  )
}

const SmallLine = ({ className = ''}) => {
  return(
    <div className={`border-[2.5px] border-[#603913] w-full ${className}`}></div>
  )
}

export {BigLine,SmallLine}