
import { api } from "../../core/util/rock"
import { makeNewGuid } from "../../core/util/guid"
import { ScheduledTransactionReciepts } from "../collections/scheduledTransactions"
import { upsertLocations } from "./upsertLocations"

const ScheduledTransactions = () => {
  if (api._ && api._.baseURL) {

    // prior to binding the observer, syncronously lookup all processing transctions
    // remove their processing status
    let stalledTransactions = ScheduledTransactionReciepts.find({
      "__processing": true
    }).fetch()

    if (stalledTransactions.length) {
      for (let transaction of stalledTransactions) {
        ScheduledTransactionReciepts.update(transaction._id, {
          $set: {
            __processing: false
          }
        })
      }
    }

    ScheduledTransactionReciepts.find().observe({
      added: function (ScheduledTransaction) {

        /*

          This is a crude (but hopefully successful) way to
          prevent a load balanced env from creating duplicated transactions

        */
        if (ScheduledTransaction.__processing) {
          return
        }

        ScheduledTransactionReciepts.update(ScheduledTransaction._id, {
          $set: {
            __processing: true
          }
        })

        delete ScheduledTransaction.__processing

        /*

          1. Create person if they dont exist
          2. Create FinancialPaymentDetail
          3. Create ScheduledTransaction
          4. Create ScheduledTransactionDetails
          5a. Create FinancialPersonSavedAccounts
          5b. Create location for person?
          6. Remove record

        */

        let {
          FinancialPaymentDetail,
          meta,
          ScheduledTransactionDetails,
          _id
        } = { ...ScheduledTransaction }

        delete ScheduledTransaction.meta
        delete ScheduledTransaction.FinancialPaymentDetail
        delete ScheduledTransaction.ScheduledTransactionDetails
        delete ScheduledTransaction._id

        let { Person, FinancialPersonSavedAccounts, Location } = meta

        let { PrimaryAliasId, PersonId } = { ...Person }
        delete Person.PersonId
        delete Person.PrimaryAliasId

        // Create Person
        Person = { ...Person, ...{
          Guid: makeNewGuid(),
          IsSystem: false,
          Gender: 0,
          SystemNote: "Created from NewSpring Apollos"
        } }

        // this should never be isGuest, but is a saftey net
        const isGuest = PersonId ? false : true
        // This scope issue is bizzare to me, but this works
        let ScopedId = PersonId
        let ScopedAliasId = PrimaryAliasId
        if (!PersonId) {
          PersonId = api.post.sync(`People`, Person)
          PrimaryAliasId = api.get.sync(`People/${PersonId}`).PrimaryAliasId
        } else {
          let RockPerson = api.get.sync(`PersonAlias/${ScopedAliasId}`)
          let RockPersonId = RockPerson.Person.Id
          RockPerson = api.get.sync(`People/${RockPersonId}`)
          Person = {...Person, ...RockPerson}
          let { PersonId, PrimaryAliasId } = Person
        }

        // add locatin data to person
        upsertLocations(PersonId, Location)


        // Create FinancialPaymentDetail
        FinancialPaymentDetail = { ...FinancialPaymentDetail, ...{
          Guid: makeNewGuid()
        } }

        const FinancialPaymentDetailId = api.post.sync(`FinancialPaymentDetails`, FinancialPaymentDetail)


        if (FinancialPaymentDetailId.status) {
          return
        }

        // Create ScheduledTransaction
        ScheduledTransaction = { ...ScheduledTransaction, ...{
          Guid: makeNewGuid(),
          AuthorizedPersonAliasId: PrimaryAliasId,
          CreatedByPersonAliasId: PrimaryAliasId,
          ModifiedByPersonAliasId: PrimaryAliasId,
          FinancialPaymentDetailId: FinancialPaymentDetailId
        } }


        let ScheduledTransactionId;
        // either mark is active or create schedule
        if (ScheduledTransaction.Id) {

          ScheduledTransactionId = ScheduledTransaction.Id
          delete ScheduledTransaction.Id
          delete ScheduledTransaction.Guid

          let response = api.patch.sync(`FinancialScheduledTransactions/${ScheduledTransactionId}`, ScheduledTransaction)
          if (response.statusText) {
            ScheduledTransactionId = response
          } else {
            // Delete all schedule transaction details associated with this account
            // since new deatils were generated
            let details = api.get.sync(`FinancialScheduledTransactionDetails?$filter=ScheduledTransactionId eq ${ScheduledTransactionId}`)
            for (let oldSchedule of details) {
              let success = api.delete.sync(`FinancialScheduledTransactionDetails/${oldSchedule.Id}`)
            }
          }

        } else {
          ScheduledTransactionId = api.post.sync(`FinancialScheduledTransactions`, ScheduledTransaction)
        }

        if (ScheduledTransactionId.status) {
          return
        }

        // Create ScheduledTransactionDetails
        for (let ScheduledTransactionDetail of ScheduledTransactionDetails) {
          ScheduledTransactionDetail = { ...ScheduledTransactionDetail, ...{
            AccountId: ScheduledTransactionDetail.AccountId,
            Amount: ScheduledTransactionDetail.Amount,
            Guid: makeNewGuid(),
            ScheduledTransactionId,
            CreatedByPersonAliasId: PrimaryAliasId,
            ModifiedByPersonAliasId: PrimaryAliasId
          } }

          api.post.sync(`FinancialScheduledTransactionDetails`, ScheduledTransactionDetail)
        }


        if (FinancialPersonSavedAccounts && FinancialPersonSavedAccounts.ReferenceNumber) {
          // Create FinancialPaymentDetail
          let SecondFinancialPaymentDetail = { ...FinancialPaymentDetail, ...{
            Guid: makeNewGuid()
          } }

          let SecondFinancialPaymentDetailId = api.post.sync(`FinancialPaymentDetails`, SecondFinancialPaymentDetail)

          if (SecondFinancialPaymentDetailId.status) {
            return
          }

          // Create FinancialPersonSavedAccounts
          FinancialPersonSavedAccounts = { ...FinancialPersonSavedAccounts, ...{
            Guid: makeNewGuid(),
            PersonAliasId: PrimaryAliasId,
            FinancialPaymentDetailId: SecondFinancialPaymentDetailId,
            CreatedByPersonAliasId: PrimaryAliasId,
            ModifiedByPersonAliasId: PrimaryAliasId
          } }

          api.post.sync(`FinancialPersonSavedAccounts`, FinancialPersonSavedAccounts)
        }


        if (ScheduledTransactionId && !ScheduledTransactionId.statusText ) {
          // remove record
          ScheduledTransactionReciepts.remove(_id)
        }

      }
    })

  }

}

export default ScheduledTransactions
