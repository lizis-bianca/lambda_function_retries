import type InjectionToken from 'tsyringe/dist/typings/providers/injection-token'
import Container from '@/main/dependency-injection/container'

export function InstanceFactory<T> (token: InjectionToken<T>): T {
  return Container.resolve(token)
}
