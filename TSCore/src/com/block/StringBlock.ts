export class StringBlock {

    /**
     * 根据语言包id获取字符串
     * @deprecated
     * @see window.getString
     */
    getString(id: string | number, ...args: any[]): string {
        return getString(id, ...args)
    }
}
