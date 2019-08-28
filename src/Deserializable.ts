export interface Deserializable<T>
{
	deserialize(input: Object): void;
}
