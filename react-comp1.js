import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { ENV } from '../../../config/config'
import FullPageLoader from '../../loaders/full-page-loader'
import { fundraiserNfts, checkBalance } from '../../../utils/web3'
import { addFundraisingNfts, beforeFundraising, getStats, beforeStats } from '../fundraising.actions'
import usdtContractAbi from '../../../utils/abis/usdt.json'
import { toast } from 'react-toastify'
import Countdown from 'react-countdown'


const { integerNumberValidator, fundraiserNFT, usdtContractAddress, auctionDate, countDownRenderer } = ENV


const GetStarted = () => {
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const [quantity, setQuantity] = useState('')
   const [loader, setLoader] = useState(true)
   const [isSubmitted, setSubmitted] = useState(false)
   const [stats, setStats] = useState(null)
   const [err, setErr] = useState('')
   const userId = ENV.getUserKeys('_id')?._id
   const fundraising = useSelector((state) => state.fundraising)


   // get stats for fundraiser NFTs
   useEffect(() => {
       dispatch(getStats())
   }, [])


   useEffect(() => {
       if (fundraising.addFundraiserNftsAuth) {
           setStats(fundraising.addFundraiserNfts.stats)
           dispatch(beforeFundraising())
           setQuantity('')
           setLoader(false)
       }
   }, [fundraising.addFundraiserNftsAuth])


   // when stats are received
   useEffect(() => {
       if (fundraising?.statsAuth) {
           setStats(fundraising?.stats)
           dispatch(beforeStats())
           setLoader(false)
       }
   }, [fundraising?.statsAuth])


   const submit = async () => {
       if (userId) {
           setSubmitted(true)
           let errMsg = validation(quantity)
           setErr(errMsg)


           if (!errMsg) {
               setLoader(true)
               let payload = {
                   quantity: Number(quantity),
                   price: fundraiserNFT.price * quantity,
                   currency: fundraiserNFT.currency
               }
...
