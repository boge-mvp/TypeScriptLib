import IAppRunListener = tsCore.IAppRunListener;

/**
 * @internal
 */
export class Activation implements IAppRunListener {


    onProxyComponentComplete() {







        for (const data of lazyInitBindView) {
            bindView(data[0], data[1], true)
        }







    }


}