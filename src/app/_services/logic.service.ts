import { OnInit } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

export class LogicService implements OnInit {
    title = 'Smart-Inventory';
    sidebarCollapsed = false;

    darkMode = new BehaviorSubject('0');//Make it 0 or 100, 0 for darkmode and 100 for light mode
    isDark: boolean = true
    //When using a behaviour subject you change its value by saying darkMode.next(value), and retrieve the result with logicService.darkMode.subscribe(function)
  
    constructor() {
      // Amplify.configure(outputs);
    }
  
    ngOnInit() {

      //this.logAuthSession();
    }

    onChangeMode() {
        if(this.isDark){
            this.darkMode.next('100');
            this.isDark = false
        }else {
            this.darkMode.next('0');
            this.isDark = true
        }
        
    }

}