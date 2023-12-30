import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";
@Pipe({
  name: "datefromnow"
})
export class DatefromnowPipe implements PipeTransform {
  transform(date: Date): string {
    var ok = moment();
    var duration = moment.duration(ok.diff(date));
    var hours = duration.asHours();
    if (hours < 21) {
      var fromNow = moment(date).fromNow();
      return fromNow;
    } else if (21 < hours && hours < 48) {
      var yesterday = "Yesterday";
      return yesterday;
    } else if (48 < hours) {
      var newDate = moment(date).format("MMM Do YYYY");
      return newDate;
    }
  }
}
